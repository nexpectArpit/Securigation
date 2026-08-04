# Database Design

# AI Security Investigation Platform

## Purpose

This document defines the conceptual database model for the AI Security Investigation Platform. It details system entities, relationships, persistence strategies, and state tracking for investigations, uploaded files, queries, Paritok metrics, evidence, and attack timelines.

---

# 1. Hybrid Persistence Strategy

The application uses a dual-tier persistence pattern to optimize for both relational integrity and fast log search:

```
                  ┌─────────────────────────────────────────┐
                  │          Relational Database            │
                  │              (PostgreSQL)               │
                  ├─────────────────────────────────────────┤
                  │ • Investigations & File Metadata        │
                  │ • Queries & Responses                   │
                  │ • Paritok Compression Metrics           │
                  │ • Evidence Associations                 │
                  │ • Attack Timelines                      │
                  └─────────────────────────────────────────┘
                                       │
                                       │ Investigation UUID Link
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │             Search Engine               │
                  │         (Elasticsearch / OpenSearch)    │
                  ├─────────────────────────────────────────┤
                  │ • Normalized Security Events            │
                  │ • Full-Text & Lexical Indexes           │
                  │ • Timestamp & IP Range Filters          │
                  └─────────────────────────────────────────┘
```

---

# 2. Conceptual Entity-Relationship Model

### Core Entities & Relationships

```
┌─────────────────┐       1:N       ┌─────────────────┐
│  Investigation  ├────────────────►│   UploadedFile  │
└────────┬────────┘                 └─────────────────┘
         │
         │ 1:N                      ┌─────────────────┐
         ├─────────────────────────►│ NormalizedEvent │ (Elasticsearch)
         │                          └─────────────────┘
         │ 1:N                      ┌─────────────────┐       1:1       ┌─────────────────┐
         ├─────────────────────────►│ConversationQuery├────────────────►│  ParitokMetric  │
         │                          └────────┬────────┘                 └─────────────────┘
         │                                   │ 1:N
         │                                   ▼
         │                          ┌─────────────────┐
         │                          │  EvidenceItem   │
         │                          └─────────────────┘
         │ 1:N                      ┌─────────────────┐
         └─────────────────────────►│  TimelineEvent  │
                                    └─────────────────┘
```

---

# 3. Entity Definitions

### 1. `Investigation`
Represents an active or archived security investigation workspace.
- **Attributes**: `id` (UUID), `title` (String), `description` (Text), `status` (`CREATED`, `PROCESSING`, `READY`, `FAILED`), `total_files` (Int), `total_events` (Int), `created_at` (Timestamp), `updated_at` (Timestamp).

### 2. `UploadedFile`
Tracks log files uploaded to an investigation.
- **Attributes**: `id` (UUID), `investigation_id` (UUID), `filename` (String), `file_size_bytes` (BigInt), `sha256_hash` (String), `detected_format` (Enum: `WINDOWS_EVTX`, `APACHE`, `SYSLOG`, `GENERIC`), `line_count` (Int), `status` (`UPLOADING`, `PARSED`, `ERROR`), `error_message` (Text), `uploaded_at` (Timestamp).

### 3. `NormalizedEvent` *(Elasticsearch Store)*
Represents an individual parsed security log entry.
- **Attributes**: `event_id` (UUID), `investigation_id` (UUID), `file_id` (UUID), `timestamp` (ISO8601), `log_source` (String), `event_type` (String), `severity` (Enum), `source_ip` (IP), `destination_ip` (IP), `source_port` (Int), `destination_port` (Int), `user_account` (String), `hostname` (String), `summary` (Text), `raw_log` (Text), `metadata` (JSON).

### 4. `ConversationQuery`
Tracks user natural language questions and AI-generated answers.
- **Attributes**: `id` (UUID), `investigation_id` (UUID), `user_question` (Text), `ai_answer` (Text), `confidence_score` (Enum: `HIGH`, `MEDIUM`, `LOW`), `retrieved_event_count` (Int), `created_at` (Timestamp).

### 5. `ParitokMetric`
Stores context compression metrics for each AI query turn.
- **Attributes**: `id` (UUID), `query_id` (UUID, Foreign Key), `original_token_count` (Int), `compressed_token_count` (Int), `compression_ratio` (Float), `tokens_saved` (Int), `estimated_cost_saved_usd` (Float), `estimated_latency_reduction_ms` (Int), `processed_at` (Timestamp).

### 6. `EvidenceItem`
Maps a conversation response turn to exact log event IDs used as supporting evidence.
- **Attributes**: `id` (UUID), `query_id` (UUID), `event_id` (UUID), `relevance_score` (Float), `citation_reason` (Text).

### 7. `TimelineEvent`
Represents milestone events in the generated attack narrative.
- **Attributes**: `id` (UUID), `investigation_id` (UUID), `timestamp` (ISO8601), `title` (String), `description` (Text), `mitre_tactic` (String), `severity` (Enum), `associated_event_ids` (Array of UUIDs).

---

# 4. Lifecycle & Data Retention

- **Cascading Deletions**: Deleting an `Investigation` cleanly purges associated `UploadedFile`, `ConversationQuery`, `ParitokMetric`, `EvidenceItem`, and `TimelineEvent` records, alongside purging indexed events in Elasticsearch by `investigation_id`.
- **Transaction Boundaries**: File state updates and query logging happen within ACID transactions to maintain consistent UI dashboard counters.
