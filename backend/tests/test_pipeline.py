import pytest
from app.ingestion.normalizer import detect_and_normalize
from app.retrieval.search_engine import search_engine
from app.retrieval.evidence_pack import assemble_evidence_pack
from app.paritok.paritok_client import paritok_client
from app.llm.groq_reasoning import groq_reasoning

def test_log_ingestion_and_normalization():
    lines = [
        "2026-07-31T00:04:12Z linux-sec-node sshd[4102]: Failed password for invalid user root from 192.168.1.105 port 49152 ssh2",
        "2026-07-31T00:06:45Z linux-sec-node sshd[4189]: Accepted password for admin from 192.168.1.105 port 49200 ssh2",
        "2026-07-31T00:07:10Z linux-sec-node sudo: admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash"
    ]
    fmt, events = detect_and_normalize(lines, "test-inv-01", "auth.log")
    
    assert fmt == "SYSLOG"
    assert len(events) == 3
    assert events[0].source_ip == "192.168.1.105"
    assert events[1].user_account == "admin"

def test_retrieval_and_paritok_pipeline():
    lines = [f"2026-07-31T00:0{i % 10}:00Z sshd[{i}]: Failed password for user admin from 192.168.1.105" for i in range(100)]
    fmt, events = detect_and_normalize(lines, "test-inv-02", "auth.log")
    search_engine.add_events("test-inv-02", events)

    retrieved = search_engine.query("test-inv-02", "failed password 192.168.1.105")
    assert len(retrieved) > 0

    evidence_pack = assemble_evidence_pack("test-inv-02", "Where did the attack originate?", retrieved)
    assert evidence_pack.event_count == len(retrieved)
    assert "192.168.1.105" in evidence_pack.extracted_entities

    compressed_events, metrics, compressed_text = paritok_client.optimize_evidence_pack(evidence_pack)
    assert len(compressed_events) < len(retrieved)
    assert metrics.compression_ratio > 0

    answer, evidence_used, summary, graph, timeline = groq_reasoning.analyze_compressed_context(
        "Where did the attack originate?",
        compressed_events,
        compressed_text
    )
    assert "192.168.1.105" in answer or len(evidence_used) > 0
    assert len(graph.nodes) > 0
    assert len(timeline) > 0
