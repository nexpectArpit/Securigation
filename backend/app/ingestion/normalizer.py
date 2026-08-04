from typing import List, Tuple
from app.ingestion.parsers import (
    WindowsEvtxParser,
    SyslogParser,
    ApacheParser,
    GenericRegexParser,
    BaseParser
)
from app.models.schemas import UnifiedSecurityEvent

PARSERS: List[BaseParser] = [
    WindowsEvtxParser(),
    SyslogParser(),
    ApacheParser(),
    GenericRegexParser()
]

def detect_and_normalize(lines: List[str], investigation_id: str, log_source: str) -> Tuple[str, List[UnifiedSecurityEvent]]:
    """
    Selects the best parser based on confidence score and normalizes lines into UnifiedSecurityEvent models.
    """
    sample = lines[:30]
    best_parser = None
    best_score = -1.0

    for parser in PARSERS:
        score = parser.can_parse(sample)
        if score > best_score:
            best_score = score
            best_parser = parser

    format_name = best_parser.__class__.__name__.replace("Parser", "").upper() if best_parser else "GENERIC"
    raw_events = best_parser.parse_lines(lines, investigation_id, log_source)
    
    normalized_events = [UnifiedSecurityEvent(**evt) for evt in raw_events]
    return format_name, normalized_events
