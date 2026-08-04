# Log Processing Specification

# AI Security Investigation Platform

## Purpose

This document defines the complete lifecycle of security log files from upload to normalized event storage. It establishes the architectural principles, format detection strategy, parsing engine design, event normalization schema, error handling policies, and streaming processing mechanics.

---

# 1. Log Ingestion Lifecycle

The log processing pipeline transforms raw, heterogeneous log formats into a structured, unified investigation event stream.

```
[Raw Log File Upload]
       ↓
[Validation & Hash Verification]
       ↓
[Format & Structure Detection Engine]
       ↓
[Stream Partitioning & Chunking]
       ↓
[Format-Specific / Generic Parser]
       ↓
[Event Normalization & Standard Schema Mapping]
       ↓
[Validation & Enrichment]
       ↓
[Batch Indexing & Storage Engine]
```

---

# 2. Upload Lifecycle & Streaming Architecture

To handle files ranging from megabytes to gigabytes without memory exhaustion, the ingestion engine uses a stream-based architecture:

- **Streaming Upload**: File contents are streamed directly to temporary storage or buffer queues.
- **Asynchronous Chunking**: Files are chunked into fixed-size byte ranges or line buffers for parallel background processing.
- **Backpressure Management**: Ingestion queues control processing rate to prevent database or indexing engine overload.
- **Progress Tracking**: Real-time progress updates emit events for total bytes read, lines processed, successful events, and parse error counts.

---

# 3. File Validation & Pre-processing

Before parsing begins, files pass through strict integrity checks:

- **Checksum Computation**: SHA-256 calculation for audit trail and duplicate detection.
- **Encoding Inspection**: Automatic UTF-8, UTF-16, ASCII encoding detection and normalization.
- **MIME & Structure Validation**: Preliminary headers inspect whether the file is binary (e.g., `.evtx`), plain text, compressed archive (`.gz`, `.zip`), or JSON/XML.
- **Compression Unpacking**: Automatic inline decompression streaming for compressed archives.

---

# 4. Format Detection Engine

The system automatically identifies log types without requiring user intervention using a confidence-weighted signature matrix:

| Log Type | Primary Signatures & Patterns | Detection Strategy |
| :--- | :--- | :--- |
| **Windows Event Logs (`.evtx`)** | File Header Magic Bytes (`ElfFile\x00`), XML schema namespaces | Binary header inspection |
| **Apache / Nginx Access** | Combined Log Format regex (`CLIENT_IP - USER [DATE] "GET /..." HTTP_STATUS RATIO`) | Pattern matching on sample lines |
| **Linux Syslog (`/var/log/syslog`)** | RFC 3164 / RFC 5424 headers (`<PRI>VERSION TIMESTAMP HOST APP...`) | Syslog header regex parser |
| **Firewall Logs (pfSense / Palo Alto / AWS Security)** | CSV / Key-Value structures (`src=... dst=... action=deny`) | Key-value density evaluation |
| **Authentication Logs (`/var/log/auth.log`)** | `sshd[PID]`, `pam_unix`, `Accepted password for...` | Keyword & regex heuristics |
| **Generic / Unknown** | Unstructured timestamps, log levels (INFO, WARN, ERROR) | Fallback regex parser |

---

# 5. Parser Architecture & Extensibility

The parsing engine uses a plugin architecture. Each parser implements a unified contract:

- **`CanParse(sample_buffer)`**: Returns confidence score (0.0 to 1.0).
- **`ParseStream(line_stream)`**: Asynchronous generator yielding raw key-value pairs or structured records.
- **`ExtractRawFields(record)`**: Extracts standard attributes (Timestamp, Source, Target, Action).

### Modular Parsers

- **Windows EVTX Parser**: Binary parser extracting Event IDs, Provider Names, TargetUserSid, ComputerName.
- **Syslog Parser**: Standard RFC 3164/5424 regex parser.
- **Web Server Parser**: Apache Combined / Nginx log pattern extractor.
- **JSON / Cloud Trail Parser**: Structured JSON stream reader.
- **Fallback Generic Parser**: Regex-driven pattern extractor targeting ISO8601/RFC3339 timestamps, IP addresses, log levels, hostnames, and text payloads.

---

# 6. Event Normalization Schema

All parsers map raw attributes to a Unified Investigation Event Model:

| Field Name | Data Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `event_id` | UUID | Unique identifier for event | `123e4567-e89b-12d3-a456-426614174000` |
| `investigation_id` | UUID | Parent investigation identifier | `8f310a01-52ab-41c9-912f-110022334455` |
| `timestamp` | ISO8601 UTC | Normalized event timestamp | `2026-07-31T01:15:00.000Z` |
| `log_source` | String | Source filename or system type | `auth.log` / `Windows-Security` |
| `event_type` | Enum | Standardized classification | `AUTHENTICATION_FAILURE`, `NETWORK_CONNECTION` |
| `severity` | Enum | Normalized severity level | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `source_ip` | IP Address | Originating IP address | `192.168.1.105` |
| `destination_ip` | IP Address | Target IP address | `10.0.0.1` |
| `source_port` | Integer | Originating port | `49152` |
| `destination_port` | Integer | Target port | `443` |
| `user_account` | String | Username or SID involved | `admin_user` |
| `hostname` | String | Affected system hostname | `DC-01.corp.internal` |
| `summary` | Text | Human-readable event description | `Failed SSH authentication for root from 192.168.1.105` |
| `raw_log` | Text | Original raw line for auditing | Full unparsed log string |
| `metadata` | JSON Object | Arbitrary un-normalized attributes | `{"process_id": 4120, "session_id": "0x4a"}` |

---

# 7. Error Handling & Fault Tolerance

- **Partial Failure Resiliency**: Unparseable lines do not interrupt the pipeline. Unparseable lines fall back to the Generic Parser or are stored as `UNPARSED_LOG_EVENT` with raw text attached.
- **Parse Error Audit Trail**: File processing metrics track `total_lines`, `parsed_lines`, `failed_lines`.
- **Malformed Timestamp Handling**: Events missing valid timestamps default to the file creation/upload time with an `imputed_timestamp` metadata flag.

---

# 8. High-Performance Processing & Batching

- **Stream Partitioning**: Log files are read in 4MB streaming chunks.
- **Worker Pools**: Multi-worker background tasks parse and normalize chunks concurrently.
- **Bulk Vector / Index Insertion**: Normalized events are flushed into storage in configurable batches (e.g., 2,000 events per bulk write) to maximize index throughput.
