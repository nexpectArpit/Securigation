import re
from typing import List
from app.models.schemas import UnifiedSecurityEvent, EvidencePack

def assemble_evidence_pack(investigation_id: str, question: str, retrieved_events: List[UnifiedSecurityEvent]) -> EvidencePack:
    """
    Packages question, retrieved log events, entities, and temporal bounds into a clean EvidencePack.
    """
    entities = set()
    ip_pattern = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')

    for evt in retrieved_events:
        if evt.source_ip:
            entities.add(evt.source_ip)
        if evt.destination_ip:
            entities.add(evt.destination_ip)
        if evt.user_account:
            entities.add(evt.user_account)
        if evt.hostname:
            entities.add(evt.hostname)

    timestamps = [evt.timestamp for evt in retrieved_events if evt.timestamp]
    temporal_bounds = {
        "start": min(timestamps) if timestamps else "N/A",
        "end": max(timestamps) if timestamps else "N/A"
    }

    return EvidencePack(
        investigation_id=investigation_id,
        question=question,
        retrieved_events=retrieved_events,
        event_count=len(retrieved_events),
        extracted_entities=list(entities),
        temporal_bounds=temporal_bounds,
        metadata={"retrieval_strategy": "Hybrid Entity BM25 Index"}
    )
