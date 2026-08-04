# Deployment Architecture

# AI Security Investigation Platform

## Purpose

This document defines the deployment topology, container configuration, service orchestration, environment setup, and infrastructure requirements for the platform.

---

# 1. System Topology Overview

```
                          ┌───────────────────────────┐
                          │   Client Browser (UI)     │
                          └─────────────┬─────────────┘
                                        │ HTTPS / WSS
                                        ▼
                          ┌───────────────────────────┐
                          │    API Gateway / NGINX    │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌─────────────────────┐                                   ┌─────────────────────┐
│  Frontend Service   │                                   │   Backend API Engine│
│   (Next.js App)     │                                   │      (FastAPI)      │
└─────────────────────┘                                   └──────────┬──────────┘
                                                                     │
                 ┌───────────────────────────────────────────────────┼───────────────────────────────────┐
                 ▼                                                   ▼                                   ▼
      ┌────────────────────┐                               ┌────────────────────┐              ┌──────────────────┐
      │  Background Worker │                               │ Relational Database│              │  Search Engine   │
      │ (Parsing / Ingest) │                               │    (PostgreSQL)    │              │  (Elasticsearch) │
      └────────────────────┘                               └────────────────────┘              └──────────────────┘
                 │
                 ▼
      ┌────────────────────┐                               ┌────────────────────┐
      │   Paritok Engine   │──────────────────────────────►│    LLM Service     │
      │(Context Compressor)│                               │    (Groq API)      │
      └────────────────────┘                               └────────────────────┘
```

---

# 2. Containerized Services

The application is fully containerized using Docker and orchestrated via Docker Compose (for local development/hackathon demo) or Kubernetes (for production):

1. **`web`**: Next.js React frontend serving the SOC Investigation Command UI.
2. **`api`**: FastAPI application handling REST endpoints, session state, query orchestration.
3. **`worker`**: Celery / Redis background worker processing log uploads, running format detection & normalization.
4. **`db`**: PostgreSQL 16 database storing investigations, files, queries, metrics, and timelines.
5. **`search`**: Elasticsearch / OpenSearch cluster indexing normalized security events.
6. **`paritok-sdk`**: Paritok context compression layer integrated via Python/TypeScript SDK.

---

# 3. Environment & Configuration Management

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string.
- `ELASTICSEARCH_URL`: Search engine cluster endpoint.
- `PARITOK_API_KEY`: API key for Paritok compression engine.
- `GROQ_API_KEY`: API key for fast LLM inference provider (Groq).
- `MAX_UPLOAD_SIZE_MB`: Configurable upload ceiling (default `500`).
