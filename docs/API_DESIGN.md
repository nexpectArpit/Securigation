# API Specification

# AI Security Investigation Platform

## Purpose

This document defines the RESTful API contract for the AI Security Investigation Platform. It specifies endpoints, request/response structures, resources, status codes, upload flows, AI query pipelines, metrics retrieval, and error handling.

---

# 1. API Architecture & Conventions

- **Base URL**: `/api/v1`
- **Protocol**: HTTPS / REST
- **Format**: JSON (`Content-Type: application/json`)
- **Multipart Ingestion**: `multipart/form-data` for file uploads
- **Standard Error Format**: RFC 7807 Problem Details

---

# 2. Endpoint Summary

| Resource | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Investigations** | `POST` | `/api/v1/investigations` | Create a new investigation workspace |
| | `GET` | `/api/v1/investigations` | List existing investigations |
| | `GET` | `/api/v1/investigations/{id}` | Get investigation details & state |
| | `DELETE`| `/api/v1/investigations/{id}` | Delete investigation & associated data |
| **Log Upload** | `POST` | `/api/v1/investigations/{id}/files` | Stream & upload log file(s) |
| | `GET` | `/api/v1/investigations/{id}/files` | List uploaded files & parse status |
| **Status & Parsing**| `GET` | `/api/v1/investigations/{id}/status` | Get ingestion progress & event counts |
| **AI Query** | `POST` | `/api/v1/investigations/{id}/query` | Ask natural language question |
| **Timeline** | `GET` | `/api/v1/investigations/{id}/timeline` | Retrieve chronological attack timeline |
| **Metrics** | `GET` | `/api/v1/investigations/{id}/metrics` | Retrieve Paritok efficiency metrics |
| **Evidence** | `GET` | `/api/v1/investigations/{id}/evidence/{query_id}` | Retrieve supporting evidence log events |

---

# 3. Endpoint Specifications

### 3.1 Create Investigation
`POST /api/v1/investigations`

**Request Payload**:
```json
{
  "title": "Operation Red Line - DC Compromise",
  "description": "Suspicious auth spikes on Domain Controller 01"
}
```

**Response Payload (`201 Created`)**:
```json
{
  "id": "8f310a01-52ab-41c9-912f-110022334455",
  "title": "Operation Red Line - DC Compromise",
  "status": "CREATED",
  "created_at": "2026-07-31T01:20:00Z"
}
```

---

### 3.2 Upload Log Files
`POST /api/v1/investigations/{id}/files`

**Content-Type**: `multipart/form-data`

**Form Parameters**:
- `files`: File byte array (Single or multi-file selection)

**Response Payload (`202 Accepted`)**:
```json
{
  "investigation_id": "8f310a01-52ab-41c9-912f-110022334455",
  "files": [
    {
      "file_id": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
      "filename": "security_events.evtx",
      "size_bytes": 14285700,
      "status": "UPLOADING"
    }
  ]
}
```

---

### 3.3 AI Investigation Query
`POST /api/v1/investigations/{id}/query`

**Request Payload**:
```json
{
  "question": "Which IP address attempted bruteforce authentication first?"
}
```

**Response Payload (`200 OK`)**:
```json
{
  "query_id": "c9d8e7f6-a5b4-3210-9876-54321fedcba0",
  "user_question": "Which IP address attempted bruteforce authentication first?",
  "answer": "The attack originated from IP address 192.168.1.105 on 2026-07-31 at 00:04:12 UTC. Over 1,200 failed SSH authentication attempts occurred within 4 minutes targeting the 'admin' account.",
  "confidence_score": "HIGH",
  "paritok_metrics": {
    "original_token_count": 84200,
    "compressed_token_count": 3150,
    "compression_ratio": 26.7,
    "tokens_saved": 81050,
    "cost_savings_usd": 0.162,
    "latency_reduction_ms": 2840
  },
  "supporting_evidence_count": 4,
  "created_at": "2026-07-31T01:21:15Z"
}
```

---

### 3.4 Retrieve Paritok Metrics
`GET /api/v1/investigations/{id}/metrics`

**Response Payload (`200 OK`)**:
```json
{
  "investigation_id": "8f310a01-52ab-41c9-912f-110022334455",
  "total_queries_executed": 5,
  "cumulative_metrics": {
    "total_original_tokens": 420000,
    "total_compressed_tokens": 15800,
    "average_compression_ratio": 26.58,
    "total_tokens_saved": 404200,
    "total_cost_saved_usd": 0.808,
    "total_latency_saved_ms": 14200
  }
}
```

---

# 4. Standardized Error Handling

All error responses conform to RFC 7807:

```json
{
  "type": "https://api.investigation-platform.io/errors/unsupported-format",
  "title": "Unsupported File Format",
  "status": 400,
  "detail": "The uploaded file 'dump.raw' could not be parsed. Valid formats include .evtx, syslog, Apache, and standard security JSON.",
  "instance": "/api/v1/investigations/8f310a01/files"
}
```
