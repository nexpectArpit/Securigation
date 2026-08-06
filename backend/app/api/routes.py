from fastapi import APIRouter, UploadFile, File, HTTPException, status, Header
from typing import List, Dict
import uuid
from datetime import datetime

from app.models.schemas import (
    InvestigationInfo,
    UploadedFileInfo,
    QueryRequest,
    QueryResponse,
    UnifiedSecurityEvent
)
from app.samples.sample_manager import INVESTIGATIONS_STORE, SAMPLE_DATASETS
from app.ingestion.normalizer import detect_and_normalize
from app.retrieval.search_engine import search_engine
from app.retrieval.evidence_pack import assemble_evidence_pack
from app.paritok.paritok_client import paritok_client
from app.llm.groq_reasoning import groq_reasoning

router = APIRouter()

# Store previous queries for replay modal
QUERIES_STORE: Dict[str, QueryResponse] = {}

@router.get("/investigations/samples", response_model=List[Dict])
async def get_sample_investigations():
    """Returns list of 1-click pre-loaded demo investigation datasets."""
    result = []
    for ds in SAMPLE_DATASETS:
        inv_id = ds["id"]
        inv = INVESTIGATIONS_STORE.get(inv_id)
        result.append({
            "id": ds["id"],
            "title": ds["title"],
            "description": ds["description"],
            "status": "READY",
            "is_demo": True,
            "created_at": "",
            "total_events": inv.total_events if inv else ds["events_count"],
            "files": [
                {
                    "file_id": ds["id"],
                    "filename": ds["filename"],
                    "size_bytes": inv.files[0].size_bytes if (inv and inv.files) else 0,
                    "detected_format": ds["format"],
                    "event_count": inv.total_events if inv else ds["events_count"],
                    "status": "PARSED"
                }
            ]
        })
    return result

@router.get("/investigations", response_model=List[InvestigationInfo])
async def list_investigations():
    """Lists all active and demo investigations."""
    return list(INVESTIGATIONS_STORE.values())

@router.post("/investigations", response_model=InvestigationInfo, status_code=status.HTTP_201_CREATED)
async def create_investigation(title: str = "New Security Investigation", description: str = "Log investigation workspace"):
    """Creates a new empty investigation workspace."""
    # Wipe out old custom investigations from store to keep RAM footprint low
    DEMO_IDS = {"demo-apt29-compromise", "demo-apache-webshell", "demo-windows-lateral"}
    for old_id in list(INVESTIGATIONS_STORE.keys()):
        if old_id not in DEMO_IDS:
            del INVESTIGATIONS_STORE[old_id]

    inv_id = str(uuid.uuid4())
    inv_info = InvestigationInfo(
        id=inv_id,
        title=title,
        description=description,
        status="READY",
        files=[],
        total_events=0,
        is_demo=False
    )
    INVESTIGATIONS_STORE[inv_id] = inv_info
    return inv_info

@router.get("/investigations/{inv_id}", response_model=InvestigationInfo)
async def get_investigation(inv_id: str):
    """Retrieves metadata for a specific investigation."""
    if inv_id not in INVESTIGATIONS_STORE:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return INVESTIGATIONS_STORE[inv_id]

@router.post("/investigations/{inv_id}/upload", response_model=InvestigationInfo)
async def upload_log_files(inv_id: str, files: List[UploadFile] = File(...)):
    """Handles log file upload with streaming line sampler."""
    import zipfile
    import random
    import time

    MAX_HEAD = 5_000
    MAX_MID  = 5_000
    MAX_TAIL = 5_000
    CHUNK_SIZE = 1024 * 256  # 256KB chunks

    if inv_id not in INVESTIGATIONS_STORE:
        inv_info = InvestigationInfo(
            id=inv_id,
            title=f"Investigation #{inv_id[:8]}",
            description="Uploaded security logs"
        )
        INVESTIGATIONS_STORE[inv_id] = inv_info

    inv_info = INVESTIGATIONS_STORE[inv_id]

    for upload in files:
        print(f"[Upload] START: {upload.filename} — waiting for multipart body to finish buffering...")
        t0 = time.time()
        MAX_HEAD = 5000
        MAX_MID = 15000
        MAX_TAIL = 5000
        MAX_SCAN_LINES = 50000

        head_lines: list = []
        reservoir: list = []
        tail_buf: list = []
        priority_lines: list = []
        total_lines = 0
        total_bytes = 0

        # Security indicators to prioritize during stream reading
        SEC_KEYWORDS = ("error", "fail", "denied", "post", "sudo", "accepted", "401", "403", "500", "login", "unauthorized", "cmd", "eval", "exploit", "bruteforce", "root", "unauthenticated")

        # Helper to process a stream of lines with smart early-stop cap
        def process_line_stream(line_iterator) -> bool:
            nonlocal total_lines
            for raw_line in line_iterator:
                if total_lines >= MAX_SCAN_LINES:
                    return False  # Reached max scan limit — stop processing further lines
                if not raw_line:
                    continue
                try:
                    line = raw_line.decode("utf-8", errors="replace").rstrip()
                except Exception:
                    continue
                if not line:
                    continue

                total_lines += 1
                line_lower = line.lower()

                # Always keep high-priority security events
                if any(kw in line_lower for kw in SEC_KEYWORDS):
                    if len(priority_lines) < 10000:
                        priority_lines.append(line)

                if total_lines <= MAX_HEAD:
                    head_lines.append(line)
                else:
                    if len(reservoir) < MAX_MID:
                        reservoir.append(line)
                    else:
                        j = random.randint(0, total_lines - MAX_HEAD - 1)
                        if j < MAX_MID:
                            reservoir[j] = line

                    if len(tail_buf) < MAX_TAIL:
                        tail_buf.append(line)
                    else:
                        tail_buf[total_lines % MAX_TAIL] = line
            return True

        # Check if the uploaded file is a zip archive
        is_zip = upload.filename.endswith(".zip")
        
        if is_zip:
            print(f"[Upload] Detected ZIP archive: {upload.filename}. Extracting with Smart Ingestion Filter...")
            try:
                # Open zip archive using the spooled temporary file
                with zipfile.ZipFile(upload.file) as z:
                    for member in z.infolist():
                        if total_lines >= MAX_SCAN_LINES:
                            print(f"[Upload] Reached Smart Ingestion limit ({MAX_SCAN_LINES:,} lines scanned). Skipping remaining members.")
                            break
                        # Skip directories and metadata folders
                        if member.is_dir() or member.filename.startswith("__MACOSX") or ".DS_Store" in member.filename:
                            continue
                        
                        print(f"[Upload] Streaming lines from zip member: {member.filename} ({member.file_size/1024/1024:.1f} MB)...")
                        total_bytes += member.file_size
                        
                        with z.open(member) as f:
                            leftover = b""
                            should_continue = True
                            while should_continue:
                                chunk = f.read(CHUNK_SIZE)
                                if not chunk:
                                    break
                                chunk = leftover + chunk
                                parts = chunk.split(b"\n")
                                leftover = parts[-1]
                                should_continue = process_line_stream(parts[:-1])
                            if leftover and should_continue:
                                process_line_stream([leftover])
            except Exception as e:
                print(f"[Upload] Error processing ZIP archive: {e}")
        else:
            # Regular text file stream
            print(f"[Upload] Reading chunk stream from raw file: {upload.filename}...")
            leftover = b""
            should_continue = True
            while should_continue:
                chunk = await upload.read(CHUNK_SIZE)
                if not chunk:
                    break
                total_bytes += len(chunk)
                chunk = leftover + chunk
                parts = chunk.split(b"\n")
                leftover = parts[-1]
                should_continue = process_line_stream(parts[:-1])
            if leftover and should_continue:
                process_line_stream([leftover])

        elapsed = time.time() - t0
        print(f"[Upload] DONE processing: {total_bytes/1024/1024:.1f}MB uncompressed, {total_lines:,} lines scanned in {elapsed:.1f}s")

        # Assemble sampled lines (giving top priority to security keyword matches)
        seen: set = set()
        sampled: list = []
        for line in (priority_lines + head_lines + reservoir + tail_buf):
            if line not in seen:
                seen.add(line)
                sampled.append(line)

        print(f"[Upload] Sampled {len(sampled):,} lines — running normalizer...")
        t1 = time.time()

        format_name, events = detect_and_normalize(sampled, inv_id, upload.filename)
        print(f"[Upload] Normalizer done: {len(events):,} events in {time.time()-t1:.1f}s")

        file_info = UploadedFileInfo(
            filename=upload.filename,
            size_bytes=total_bytes,
            detected_format=format_name,
            event_count=len(events)
        )
        inv_info.files.append(file_info)
        inv_info.total_events += len(events)
        search_engine.add_events(inv_id, events)

        # Force immediate garbage collection to release temporary stream buffers
        import gc
        gc.collect()

        print(f"[Upload] COMPLETE: {upload.filename} → {len(events):,} events indexed. Total: {time.time()-t0:.1f}s")

    inv_info.status = "READY"
    return inv_info

@router.post("/investigations/{inv_id}/query", response_model=QueryResponse)
async def execute_investigation_query(inv_id: str, request: QueryRequest, x_paritok_key: str = Header(None), x_groq_key: str = Header(None)):
    """
    Executes the full pipeline:
    1. Evidence Retrieval
    2. Evidence Pack Assembly
    3. Paritok Context Optimization
    4. AI Reasoning (Groq)
    5. Returns Answer + Evidence Used + Graph + Timeline + Telemetry
    """
    if inv_id not in INVESTIGATIONS_STORE:
        raise HTTPException(status_code=404, detail="Investigation not found")

    # Step 1: Evidence Retrieval (Retrieve top candidates)
    retrieved_events = search_engine.query(inv_id, request.question, limit=1500)
    if not retrieved_events:
        # Fallback to all events if query returns empty
        retrieved_events = search_engine.get_all_events(inv_id)[:1500]

    # Step 2: Evidence Pack Assembly
    evidence_pack = assemble_evidence_pack(inv_id, request.question, retrieved_events)

    # Step 3: Paritok Context Optimization
    compressed_events, paritok_metrics, compressed_text = paritok_client.optimize_evidence_pack(evidence_pack, x_paritok_key)

    # Step 4: AI Reasoning (Groq / Grounded Engine)
    answer, evidence_used, summary, graph, timeline = groq_reasoning.analyze_compressed_context(
        request.question,
        compressed_events,
        compressed_text,
        x_groq_key
    )

    query_id = str(uuid.uuid4())
    query_response = QueryResponse(
        query_id=query_id,
        question=request.question,
        answer=answer,
        evidence_used=evidence_used,
        summary=summary,
        graph=graph,
        timeline=timeline,
        paritok_metrics=paritok_metrics,
        supporting_evidence=compressed_events[:25],  # Top 25 supporting events for evidence drawer
        created_at=datetime.utcnow().isoformat()
    )

    QUERIES_STORE[query_id] = query_response
    return query_response

@router.get("/investigations/{inv_id}/replay/{query_id}", response_model=Dict)
async def get_query_replay_trace(inv_id: str, query_id: str):
    """Returns step-by-step trace sequence for the ▶ Replay Investigation modal."""
    if query_id not in QUERIES_STORE:
        raise HTTPException(status_code=404, detail="Query replay trace not found")

    query_res = QUERIES_STORE[query_id]
    metrics = query_res.paritok_metrics

    trace_steps = [
        {
            "step": 1,
            "title": "Natural Language Question Submitted",
            "detail": f"Question: '{query_res.question}'",
            "timestamp": query_res.created_at
        },
        {
            "step": 2,
            "title": "1. Evidence Retrieval Executed",
            "detail": f"Retrieved {metrics.without_paritok.events} raw log candidate events ({metrics.without_paritok.tokens} tokens).",
            "timestamp": query_res.created_at
        },
        {
            "step": 3,
            "title": "2. Evidence Pack Packaged",
            "detail": "Structured payload prepared containing IP bounds, usernames, and timestamp ranges.",
            "timestamp": query_res.created_at
        },
        {
            "step": 4,
            "title": "3. Paritok Context Optimization Applied",
            "detail": f"Compressed context by {metrics.compression_ratio}% ({metrics.without_paritok.tokens} tokens ➔ {metrics.with_paritok.tokens} tokens). Saved ${metrics.cost_saved_usd} & {metrics.latency_saved_sec}s.",
            "timestamp": query_res.created_at
        },
        {
            "step": 5,
            "title": "4. AI Reasoning (Groq Llama-3)",
            "detail": f"Generated grounded answer and extracted {len(query_res.graph.nodes)} entity nodes.",
            "timestamp": query_res.created_at
        }
    ]

    return {
        "query_id": query_id,
        "question": query_res.question,
        "trace_steps": trace_steps,
        "metrics": metrics
    }
