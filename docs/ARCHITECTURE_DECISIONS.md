# Architecture Decision Records (ADRs)

# AI Security Investigation Platform

## Purpose

This document records the key architectural decisions, alternatives evaluated, justifications, and trade-offs for the AI Security Investigation Platform.

---

# ADR-001: Mandatory Paritok Context Compression Layer

### Context & Problem
Security log investigations generate large, highly repetitive candidate contexts (tens to hundreds of thousands of tokens). Feeding raw context directly into LLMs causes extreme latency, prohibitive token costs, and frequent context window truncation.

### Alternatives Considered
1. *Raw Context RAG*: Send all retrieved candidate log lines directly to the LLM.
2. *Vector Truncation*: Hard limit candidate logs to top 10 items (loses critical threat context).
3. *Paritok Context Compression*: Insert Paritok as a mandatory middle layer to compress candidate contexts before sending to LLM.

### Decision
Adopt **Paritok Context Compression** as a non-bypassable architectural layer for all AI investigation queries.

### Justification & Trade-offs
- **Pros**: Reduces token consumption by 85–95%, lowers query latency to under 3s, slashes API costs, and visually demonstrates Paritok's value proposition to hackathon judges.
- **Cons**: Adds a micro-stage to the backend pipeline.

---

# ADR-002: Elasticsearch for Security Log Search over Pure Vector Databases

### Context & Problem
Security analysts query logs by exact IP addresses, timestamp windows, Event IDs, and usernames. Pure vector databases lack exact filtering and numerical date range precision.

### Decision
Use **Elasticsearch / OpenSearch** as the primary search and retrieval engine for normalized security events.

### Justification & Trade-offs
- **Pros**: Sub-millisecond exact IP range filtering, precise timestamp windowing, BM25 full-text matching, and high bulk write throughput.
- **Cons**: Higher memory footprint than lightweight key-value stores.

---

# ADR-003: FastAPI (Python) for Backend Service

### Context & Problem
The backend requires high-async I/O for streaming file uploads, native SDK integration with Paritok & AI libraries, and fast execution.

### Decision
Use **FastAPI** with Python 3.11+.

### Justification
- Native support for async concurrency, Pydantic type validation, automatic OpenAPI schema generation, and seamless integration with AI/data processing tools.

---

# ADR-004: Next.js + Tailwind / Vanilla CSS for Frontend Workspace

### Context & Problem
The user interface must deliver a high-performance, dark SOC command dashboard with real-time stream updates and glassmorphic micro-interactions.

### Decision
Use **Next.js (React)** with custom modern styling.

### Justification
- Component-driven architecture, fast client-side state management, and rich visualization library support.
