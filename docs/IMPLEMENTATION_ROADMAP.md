# Implementation Roadmap

# AI Security Investigation Platform

## Purpose

This document outlines the sequential development phases, deliverables, dependencies, success criteria, and risk levels for building the AI Security Investigation Platform incrementally.

---

# Phase 1: Ingestion & Storage Foundation
- **Objectives**: Set up core backend models, database migrations, Elasticsearch schemas, and log parsers.
- **Deliverables**:
  - PostgreSQL & Elasticsearch database schemas.
  - Parsers for Windows EVTX, Linux Syslog, Apache Access, and Generic Regex fallback.
  - Streaming upload endpoint `/api/v1/investigations/{id}/files`.
- **Success Criteria**: Parse 50,000 log events into normalized Elasticsearch indices with < 1% parse failures.
- **Risk Level**: Low.

---

# Phase 2: Retrieval & Paritok Integration
- **Objectives**: Implement search query generation, Paritok context compression layer, and LLM reasoning handoff.
- **Deliverables**:
  - Entity & keyword extraction engine.
  - Paritok SDK compression wrapper.
  - LLM client (Groq Llama-3).
  - Paritok metrics calculator (Tokens saved, % compressed, cost/latency saved).
- **Success Criteria**: Compress 80k+ token candidate context down to < 4k tokens and generate accurate evidence-backed response in < 3 seconds.
- **Risk Level**: Medium (requires Paritok SDK key configuration).

---

# Phase 3: Investigation Engine & Artifacts
- **Objectives**: Build multi-turn investigation memory, evidence grounding, and attack timeline generator.
- **Deliverables**:
  - Stateful conversation manager.
  - Evidence attachment extractor (`EvidenceItem`).
  - ATT&CK milestone timeline generator (`TimelineEvent`).
- **Success Criteria**: Multi-turn follow-up questions correctly resolve entity references (e.g. "that IP").
- **Risk Level**: Low.

---

# Phase 4: UI / UX Command Workspace
- **Objectives**: Build modern dark SOC frontend interface in Next.js.
- **Deliverables**:
  - File Upload & Ingestion progress dashboard.
  - AI Natural Language Chat console.
  - **Paritok Metrics Hero Card** (Before vs. After compression viz).
  - Interactive Evidence Table & MITRE ATT&CK Timeline.
- **Success Criteria**: Seamless, visually stunning UI demonstrating Paritok efficiency metrics clearly at a glance.
- **Risk Level**: Low.

---

# Phase 5: Demo Verification & Polish
- **Objectives**: Run end-to-end attack scenario simulations (e.g., SSH Brute Force -> Privilege Escalation log dataset) and polish judge walkthrough.
- **Deliverables**:
  - Pre-packaged sample log datasets (`demo_bruteforce.log`, `demo_windows_security.evtx`).
  - End-to-end pipeline validation.
- **Success Criteria**: Flawless live demo execution under 3 minutes proving Paritok value.
- **Risk Level**: Low.
