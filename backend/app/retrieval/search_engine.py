import re
from typing import List, Dict
from app.models.schemas import UnifiedSecurityEvent

class InMemorySearchEngine:
    def __init__(self):
        # Maps investigation_id -> List[UnifiedSecurityEvent]
        self._index: Dict[str, List[UnifiedSecurityEvent]] = {}

    def add_events(self, investigation_id: str, events: List[UnifiedSecurityEvent]):
        DEMO_IDS = {"demo-apt29-compromise", "demo-apache-webshell", "demo-windows-lateral"}
        
        # When a new custom upload arrives, wipe out all old custom uploads from memory
        if investigation_id not in DEMO_IDS and investigation_id not in self._index:
            custom_ids = [k for k in list(self._index.keys()) if k not in DEMO_IDS]
            for old_id in custom_ids:
                del self._index[old_id]
            import gc
            gc.collect()

        if investigation_id not in self._index:
            self._index[investigation_id] = []
        self._index[investigation_id].extend(events)

    def get_all_events(self, investigation_id: str) -> List[UnifiedSecurityEvent]:
        return self._index.get(investigation_id, [])

    def query(self, investigation_id: str, question: str, limit: int = 1500) -> List[UnifiedSecurityEvent]:
        all_events = self._index.get(investigation_id, [])
        if not all_events:
            return []

        # Extract entities from question
        ip_pattern = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
        ips = ip_pattern.findall(question)

        keywords = [w.lower() for w in re.findall(r'\b[A-Za-z0-9_\-\.]+\b', question) if len(w) > 2]
        
        scored_events = []
        for event in all_events:
            score = 0
            event_text = f"{event.summary} {event.raw_log} {event.user_account or ''} {event.source_ip or ''} {event.hostname or ''}".lower()

            # Exact IP match (Highest weight)
            for ip in ips:
                if event.source_ip == ip or event.destination_ip == ip:
                    score += 50

            # Keyword matching
            for kw in keywords:
                if kw in event_text:
                    score += 5

            # Severity boost for security analysis
            if event.severity.value in ["HIGH", "CRITICAL"]:
                score += 10

            if score > 0 or len(all_events) <= 50:
                scored_events.append((score, event))

        # Sort by score descending, then timestamp ascending
        scored_events.sort(key=lambda x: (x[0], x[1].timestamp), reverse=True)
        
        results = [evt for score, evt in scored_events[:limit]]
        # Order chronologically for causal narrative
        results.sort(key=lambda e: e.timestamp)
        return results if results else all_events[:limit]

search_engine = InMemorySearchEngine()
