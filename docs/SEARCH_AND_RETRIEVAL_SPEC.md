# Search and Retrieval Specification

# AI Security Investigation Platform

## Purpose

This document defines the search and retrieval architecture for the AI Security Investigation Platform.

It explains why structured, deterministic retrieval is critical for security investigations, how query intent is translated into structured search queries, how context is constructed, and how retrieved candidate evidence flows directly into Paritok.

---

# 1. Why Structured Retrieval Beats Generic Vector Search for Security Logs

Generic RAG applications rely heavily on dense vector embeddings. However, for cybersecurity log investigations, vector search alone introduces significant flaws:

1. **Precision Loss on Identifiers**: IP addresses (`192.168.1.1`), GUIDs, hashes (`MD5/SHA256`), port numbers, and specific usernames are frequently semantic noise to vector models but essential to investigators.
2. **Exact Timestamp Windowing**: Incident analysis requires precise temporal slicing (`between 02:14:00 UTC and 02:18:30 UTC`). Vector embeddings cannot reliably perform numerical range filtering.
3. **Exact Term Matching**: Log analysis requires exact keyword filtering (e.g., Event ID `4625` vs `4624`).

### The Solution: Hybrid Search Engine

The platform utilizes a structured search engine (e.g., Elasticsearch / OpenSearch) combining **exact boolean filtering**, **BM25 lexical search**, and **structured attribute aggregation**.

---

# 2. Retrieval Pipeline & Architecture

```
[User Question]
       ↓
[Query Intent & Entity Extraction]
       ↓
[Structured Query Generation (Filters + Terms + Time Ranges)]
       ↓
[Elasticsearch Query Execution]
       ↓
[Candidate Event Retrieval & Ranking]
       ↓
[Context Assembly & Structuring]
       ↓
[Paritok Context Compression Engine]
```

---

# 3. Indexing Strategy

To support high-throughput write performance and low-latency queries across millions of log events, the search engine indexes events using optimized field mapping schemas:

### Mapping Schema

- **`investigation_id`**: Keyword (Filter context boundary)
- **`timestamp`**: Date (`date_optional_time`)
- **`source_ip` / `destination_ip`**: IP type (Supports CIDR subnet queries e.g., `10.0.0.0/8`)
- **`user_account` / `hostname`**: Keyword (Case-insensitive exact match)
- **`event_type` / `severity`**: Keyword
- **`summary`**: Standard Analyzed Text (BM25 full-text search)
- **`raw_log`**: Unindexed or non-analyzed string (Stored for evidence payload display)
- **`metadata`**: Flattened JSON object

---

# 4. Multi-Stage Query Generation Strategy

When a user asks a natural language question (e.g., *"Show me all failed logins from IP 192.168.1.50 around midnight"*):

1. **Entity Extraction**:
   - IP: `192.168.1.50`
   - Time range: `00:00:00 UTC +/- offset`
   - Intent keywords: `failed login`, `authentication`

2. **Query Translation**:
   ```json
   {
     "bool": {
       "filter": [
         { "term": { "investigation_id": "current-inv-uuid" } },
         { "term": { "source_ip": "192.168.1.50" } },
         { "range": { "timestamp": { "gte": "2026-07-30T23:30:00Z", "lte": "2026-07-31T00:30:00Z" } } }
       ],
       "should": [
         { "match": { "event_type": "AUTHENTICATION_FAILURE" } },
         { "match": { "summary": "failed login password invalid" } }
       ],
       "minimum_should_match": 1
     }
   }
   ```

3. **Candidate Fetching**: Retrieves top $K$ (e.g., $K = 500$ to $2,000$) candidate log events matching the query criteria.

---

# 5. Investigation Context Construction

The retrieved candidate log events are serialized into a clean, structured Investigation Context block:

- **Chronological Sorting**: Events are ordered by timestamp to preserve causal narrative.
- **Deduplication**: Exact duplicate events within tight time windows are collapsed.
- **Context Envelope**: Structured metadata header added containing total retrieved events, temporal boundaries, and log source summary.

---

# 6. Handoff to Paritok

The constructed Investigation Context (which may span tens or hundreds of thousands of tokens) is **NOT** sent directly to the LLM.

Instead, the constructed candidate context is handed directly to the **Paritok Compression Engine**.

- Paritok strips redundant field prefixes, repetitive log structures, and low-information text patterns while retaining critical entity values, timestamps, and security anomaly markers.
- The compressed output is then routed to the LLM Reasoning Engine alongside the user's original question.
