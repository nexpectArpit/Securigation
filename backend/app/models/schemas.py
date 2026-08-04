from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class SeverityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class UnifiedSecurityEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    investigation_id: str
    timestamp: str
    log_source: str
    event_type: str
    severity: SeverityEnum = SeverityEnum.MEDIUM
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    user_account: Optional[str] = None
    hostname: Optional[str] = None
    summary: str
    raw_log: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class EvidencePack(BaseModel):
    investigation_id: str
    question: str
    retrieved_events: List[UnifiedSecurityEvent]
    event_count: int
    extracted_entities: List[str] = Field(default_factory=list)
    temporal_bounds: Dict[str, str] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ParitokMetricDetail(BaseModel):
    events: int
    tokens: int
    cost_usd: float
    latency_sec: float

class ParitokStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    API_DISCONNECTED = "API_DISCONNECTED"

class ParitokMetrics(BaseModel):
    without_paritok: ParitokMetricDetail
    with_paritok: ParitokMetricDetail
    compression_ratio: float
    tokens_saved: int
    cost_saved_usd: float
    latency_saved_sec: float
    status: ParitokStatusEnum = ParitokStatusEnum.ACTIVE
    status_message: str = "Paritok Context Optimization Engine Active"

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # USER, HOST, IP, FILE, ACTION

class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str

class GraphData(BaseModel):
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)

class InvestigationSummaryData(BaseModel):
    attack_started: str
    initial_access: str
    compromised_user: str
    persistence: str
    outcome: str

class TimelineEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str
    title: str
    description: str
    severity: SeverityEnum = SeverityEnum.HIGH
    associated_event_ids: List[str] = Field(default_factory=list)

class QueryRequest(BaseModel):
    question: str
    investigation_id: str

class QueryResponse(BaseModel):
    query_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    evidence_used: List[str] = Field(default_factory=list)
    summary: Optional[InvestigationSummaryData] = None
    graph: GraphData = Field(default_factory=GraphData)
    timeline: List[TimelineEvent] = Field(default_factory=list)
    paritok_metrics: ParitokMetrics
    supporting_evidence: List[UnifiedSecurityEvent] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class UploadedFileInfo(BaseModel):
    file_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    size_bytes: int
    detected_format: str
    event_count: int
    status: str = "PARSED"

class InvestigationInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    status: str = "READY"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    files: List[UploadedFileInfo] = Field(default_factory=list)
    total_events: int = 0
    is_demo: bool = False
