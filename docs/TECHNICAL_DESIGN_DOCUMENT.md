# Technical Design Document (TDD)

# AI Security Investigation Platform (Build with Paritok Edition)

## Purpose

This document serves as the master engineering blueprint for implementing the AI Security Investigation Platform. It synthesizes all specifications, architectural decisions, and product requirements into an actionable, hackathon-optimized technical implementation plan.

---

# 1. Architecture & Pipeline Overview

The platform transforms raw security logs into evidence-backed incident analyses while demonstrating **Paritok Context Optimization** as the core innovation.

### Judge-Optimized Pipeline & Evidence Pack Architecture

```
[User Natural Language Query]
              │
              ▼
  [1. Evidence Retrieval]  ──► (Searches log index, returns raw matching events)
              │
              ▼
  [2. Evidence Pack Assembly] ──► (Packages Question, Retrieved Events, Entities, Stats, Metadata)
              │
              ▼
  [3. Paritok Context Optimization] ──► (Compresses Evidence Pack by ~85-95%, outputs telemetry)
              │
              ▼
  [4. AI Reasoning (Groq)] ──► (Consumes optimized context, returns JSON answer + nodes/edges + summary)
              │
              ▼
[Interactive SOC Workspace Response (Default: Judge Mode)]
  ├── "Evidence Used" Verification Box
  ├── Paritok Compression Telemetry (Exact Tokens, Cost, Latency numbers)
  ├── Interactive Node-Edge Graph (Cytoscape.js / React Flow)
  ├── ▶ Replay Investigation Button (Large Prominent Action)
  ├── Supporting Evidence Drawer
  └── Streamlined Attack Timeline
```

---

# 2. Complete Codebase Folder Structure

```
securigation/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entrypoint & middleware
│   │   ├── config.py                # Environment configuration (Groq, Paritok keys, settings)
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py            # REST API endpoints (Investigations, Query, Demo, Metrics)
│   │   ├── ingestion/
│   │   │   ├── __init__.py
│   │   │   ├── parsers.py           # EVTX, Syslog, Apache, Generic Log Parsers
│   │   │   └── normalizer.py        # Maps raw log lines to UnifiedSecurityEvent model
│   │   ├── retrieval/
│   │   │   ├── __init__.py
│   │   │   ├── search_engine.py     # Hybrid log search index
│   │   │   └── evidence_pack.py     # Assembles structured EvidencePack object
│   │   ├── paritok/
│   │   │   ├── __init__.py
│   │   │   └── paritok_client.py    # Authentic Paritok API / Proxy client & telemetry calculator
│   │   ├── llm/
│   │   │   ├── __init__.py
│   │   │   └── groq_reasoning.py    # Groq Llama-3 client returning grounded JSON
│   │   ├── samples/
│   │   │   ├── __init__.py
│   │   │   ├── sample_manager.py    # 1-click pre-loaded demo investigation datasets
│   │   │   └── datasets/            # Sample incident log files (APT29, WebShell, etc.)
│   │   └── models/
│   │       ├── __init__.py
│   │       └── schemas.py           # Pydantic data models for requests, responses, metrics
│   ├── tests/
│   │   ├── test_parsers.py
│   │   ├── test_search.py
│   │   └── test_paritok.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx             # Main container (Default: Judge Mode)
│   │   ├── components/
│   │   │   ├── LandingPage.tsx      # 🎯 Try Demo (30s) vs Upload Your Own Logs
│   │   │   ├── JudgeModeToggle.tsx  # Toggle between Judge Mode (Default) & Analyst Mode
│   │   │   ├── PipelineStepper.tsx  # Evidence Retrieval -> Evidence Pack -> Paritok -> Groq
│   │   │   ├── ParitokMetricsHeroCard.tsx # Without vs With Paritok exact numbers comparison
│   │   │   ├── EvidenceUsedBox.tsx  # "Evidence Used" verification box
│   │   │   ├── InvestigationSummary.tsx # Executive incident summary card
│   │   │   ├── InvestigationGraph.tsx # React Flow / Cytoscape.js interactive graph
│   │   │   ├── ReplayButton.tsx     # ▶ Replay Investigation (Large prominent action)
│   │   │   ├── AttackTimeline.tsx   # Chronological event timeline
│   │   │   ├── EvidencePanel.tsx    # Filterable raw log evidence drawer
│   │   │   └── InvestigationReplayModal.tsx # Animated step-by-step trace replay modal
│   │   ├── lib/
│   │   │   └── api_client.ts        # Typed API fetch client
│   │   └── types/
│   │       └── index.ts             # TypeScript interface schemas
│   ├── package.json
│   └── tsconfig.json
├── PROJECT_OVERVIEW.md
├── TECHNICAL_DESIGN_DOCUMENT.md
└── docker-compose.yml
```

---

# 3. Core Data Models (`schemas.py`)

1. **`EvidencePack`**:
   - `question`: str
   - `retrieved_events`: List[UnifiedSecurityEvent]
   - `event_count`: int
   - `extracted_entities`: List[str]
   - `temporal_bounds`: `{ start: str, end: str }`
   - `metadata`: dict

2. **`UnifiedSecurityEvent`**:
   - `event_id` (UUID), `timestamp` (ISO8601), `log_source` (str), `event_type` (str), `severity` (Enum), `source_ip` (str), `destination_ip` (str), `user_account` (str), `hostname` (str), `summary` (str), `raw_log` (str).

3. **`ParitokMetrics`**:
   - `without_paritok`: `{ events: int, tokens: int, cost_usd: float, latency_sec: float }`
   - `with_paritok`: `{ events: int, tokens: int, cost_usd: float, latency_sec: float }`
   - `compression_ratio`: float (e.g. `86.4`)
   - `status`: Enum (`ACTIVE`, `API_DISCONNECTED`)

4. **`GraphData`**:
   - `nodes`: List[`{ id: str, label: str, type: str }`]
   - `edges`: List[`{ source: str, target: str, relationship: str }`]

---

# 4. End-to-End API Sequence Diagram

```
User (Browser)               FastAPI backend               SearchEngine            ParitokClient             Groq LLM
     │                              │                           │                        │                      │
     │── 1. Select Demo / Upload ──►│                           │                        │                      │
     │                              │── Parse & Index Logs ────►│                        │                      │
     │◄─ 2. Workspace Ready ────────│                           │                        │                      │
     │                              │                           │                        │                      │
     │── 3. Ask Question ──────────►│                           │                        │                      │
     │                              │── 4. Retrieve Candidate ─►│                        │                      │
     │                              │◄─ Raw Events ─────────────│                        │                      │
     │                              │                                                    │                      │
     │                              │── 5. Assemble EvidencePack ────────────────────────┤                      │
     │                              │── 6. Paritok Context Optimization (EvidencePack) ─►│                      │
     │                              │◄─ Compressed Evidence Pack + Exact Metrics ────────│                      │
     │                                                                                                          │
     │                              │── 7. AI Reasoning (Compressed Evidence Pack + Question) ─────────────────►│
     │                              │◄─ 8. Grounded JSON Response (Graph Nodes/Edges + Evidence) ───────────────│
     │                              │
     │◄─ 9. Render Response (Judge Mode Default, Replay Button, Graph, Timeline) ───────────────────────────────│
```

---

# 5. Front-End Features & Component Design

### 5.1 Landing Page
- Two primary interactive buttons:
  - **Primary CTA**: `🎯 Try Demo (30 seconds)` (1-click preset selector).
  - **Secondary Action**: `Upload Your Own Logs` (Drag & drop target for `.evtx`, `.log`, `.txt`).

### 5.2 Default State: 🎯 Judge Mode
- App boots directly into **Judge Mode** by default.
- Shows focused 3-minute demo interface:
  - Question Input & Live Pipeline Stepper (`Evidence Retrieval ➔ Evidence Pack ➔ Paritok ➔ Groq`)
  - **Paritok Metrics Hero Card** (Exact token numbers: e.g. 52,913 Tokens | $0.41 | 3.8s VS 7,294 Tokens | $0.06 | 0.7s)
  - **"Evidence Used"** Verification Box
  - **Interactive Graph** (Node/Edge click filters Evidence Panel)
  - **▶ Replay Investigation Button** (Large prominent action)
  - Streamlined Attack Timeline & Supporting Evidence Table

### 5.3 Interactive Graph (Cytoscape.js / React Flow Integration)
- Backend returns `{ nodes: [...], edges: [...] }`.
- Frontend library renders interactive node layout.
- Clicking any node (e.g. `Server-01`) automatically filters the Evidence Drawer to related logs.

---

# 6. Hackathon MVP Reliability & Simplification Rules

1. **Removed Temporal Suspicion Heatmap**: Eliminates unnecessary UI bloat while retaining clean Attack Timeline.
2. **Evidence Pack Abstraction**: Clean intermediate payload optimization for Paritok.
3. **Groq Only**: Single committed LLM engine.
4. **Authentic Paritok Status**: Explicit `Paritok Disconnected` banner if API key is unconfigured (no fake fallback).
5. **Default Judge Mode**: Immediate, distraction-free judging experience.
