# Investigation Engine Specification

# AI Security Investigation Platform

## Purpose

This document defines the core Investigation Engine. It details how investigations are created, maintained, updated, and queried. It specifies state management, multi-turn reasoning memory, evidence attachment, timeline generation, and confidence scoring.

---

# 1. Product Concept: Investigation Workspace vs. Chatbot

The platform is designed as an **Investigation Workspace**:

| Generic AI Chatbot | Security Investigation Workspace |
| :--- | :--- |
| Ephemeral conversation session | Persistent Investigation entity with state and evidence graph |
| Unstructured text responses | Evidence-backed answers linked directly to raw event IDs |
| Full context re-sent every turn | Retrieval + Paritok compression context pipeline |
| No domain artifact generation | Automated chronological attack timeline & metrics visualization |

---

# 2. Investigation State Model

An Investigation is a persistent container holding:

1. **Metadata**: ID, Name, Description, Status (`PROCESSING`, `READY`, `ERROR`), Created Timestamp.
2. **Associated Logs**: List of uploaded files, file sizes, format types, line counts.
3. **Normalized Event Pool**: Indexed events queryable by search engine.
4. **Conversation Trajectory**: History of user questions, retrieved event IDs, Paritok metrics, and answers.
5. **Attack Timeline**: Dynamic structured list of key attack milestones.
6. **Active Investigation Context**: Extracted entities of interest (compromised IPs, flagged users, affected hosts, time bounds).

---

# 3. Multi-Turn Investigation Reasoning & Memory

Security investigations require multi-question depth (e.g., *"What IP initiated the bruteforce?"* -> *"What did that IP do next?"* -> *"Did any user log in from it?"*).

To maintain state without context explosion:

- **Entity State Tracking**: The engine maintains a lightweight JSON state of *Focus Entities* (e.g., `focused_ip: 192.168.1.105`, `focused_user: admin`, `time_window: 2026-07-31T00:00:00Z - 01:00:00Z`).
- **Query Resolution**: Follow-up questions (e.g., *"What did it do next?"*) resolve `"it"` to `focused_ip: 192.168.1.105` before query generation.
- **Context Preservation**: Paritok compresses both prior query summaries and newly retrieved events to fit within small token windows.

---

# 4. Evidence Generation & Grounding Engine

Every answer produced by the Reasoning Engine must be strictly grounded in event data:

- **Event Citation Requirement**: Answers must reference specific log events via ID or raw timestamp.
- **Evidence Panel Mapping**: Attached log events are extracted from the retrieved set and formatted into an interactive Evidence Panel.
- **Hallucination Prevention**: If retrieved logs do not contain evidence for a user query, the engine explicitly reports: *"No log evidence found in the current investigation dataset."*

---

# 5. Automated Attack Timeline Generator

As queries are processed and key events identified, the Investigation Engine updates an Attack Timeline:

```
[2026-07-31 00:04:12 UTC] Initial Access
  └─ Brute-force SSH attempt detected from 192.168.1.105 (Event ID: #4102)

[2026-07-31 00:06:45 UTC] Compromise / Privilege Escalation
  └─ Successful root login from 192.168.1.105 for user 'admin' (Event ID: #4189)

[2026-07-31 00:12:10 UTC] Defense Evasion / Exfiltration
  └─ File transfer of 'shadow.bak' via SCP (Event ID: #4310)
```

Timeline items are categorized by standard threat frameworks (e.g., MITRE ATT&CK tactics).

---

# 6. Confidence Reporting & Reasoning Flow

Each investigation response outputs:

1. **Answer Summary**: Clear narrative explanation of findings.
2. **Confidence Score**:
   - `HIGH`: Direct log evidence confirms the answer.
   - `MEDIUM`: Partial log evidence or indirect behavioral correlations.
   - `LOW`: Inconclusive log data requiring additional logs.
3. **Paritok Efficiency Badge**: Visual metrics for tokens saved and cost/latency reduction.
4. **Supporting Evidence Table**: Filterable list of supporting log lines.
