# Hackathon Demo Plan

# AI Security Investigation Platform (Build with Paritok)

## Purpose

This document designs the live presentation flow, judge walkthrough script, metric highlights, and demonstration scenario for hackathon judging.

---

# 1. The Core Demo Narrative: "The Hero is Paritok"

### The Hook
> *"When a cyber incident occurs, security teams are flooded with hundreds of thousands of log lines. Standard LLMs cannot handle this volume efficiently—sending raw logs repeatedly drains budgets, causes multi-minute latencies, or hits token limits. Today, we present an AI Security Investigation Platform where **Paritok** transforms large, unwieldy log context into fast, affordable, evidence-backed answers."*

---

# 2. Step-by-Step Live Demo Script (3 Minutes)

### Step 1: Upload & Auto-Processing (0:00 - 0:45)
- **Action**: Drag and drop a sample 150,000-line incident dataset (`security_events.evtx` + `auth.log`).
- **Visual**: Show auto-format detection (`WINDOWS_EVTX` + `SYSLOG`) and live parsing progress counter.
- **Narrative**: *"The platform automatically detects log types, parses, and normalizes 150k events into a unified search index."*

### Step 2: The Natural Language Query (0:45 - 1:15)
- **Action**: Type question: *"Where did the attack originate, and which user account was compromised?"*
- **Visual**: Hit Enter. Watch candidate retrieval and the **Paritok Context Compression Pipeline** execute in real time.

### Step 3: The Paritok Hero Moment (1:15 - 2:00)
- **Action**: Focus judge attention on the **Paritok Metrics Hero Card**:
  - **Original Candidate Context**: `84,200 Tokens`
  - **Compressed Context**: `3,150 Tokens`
  - **Compression Ratio**: `96.3% Reduction`
  - **Cost Saved**: `$0.16 on a single question`
  - **Query Latency**: `2.1 seconds`
- **Narrative**: *"Without Paritok, sending 84k tokens to an LLM for every follow-up question is slow and expensive. Paritok compressed 96% of repetitive log noise while preserving 100% of the security evidence!"*

### Step 4: Evidence & Timeline Verification (2:00 - 3:00)
- **Action**: Open the **Supporting Evidence Table** and **Attack Timeline**.
- **Visual**: Click Event ID #4189 -> Highlight raw log line showing SSH root login from IP `192.168.1.105`.
- **Narrative**: *"Every AI answer is grounded in exact log evidence with zero hallucinations, backed by a MITRE ATT&CK timeline."*

---

# 3. Judge Checklist & Takeaways

| What the Judge Sees | What the Judge Learns |
| :--- | :--- |
| **Paritok Metrics Dashboard** | Paritok is essential for making large context AI queries viable. |
| **Evidence Table with Event IDs** | The application is a trustworthy investigation tool, not a generic chatbot. |
| **Chronological Timeline** | Security analysts get actionable incident narratives instantly. |
| **Sub-3s Query Response** | Compression drastically reduces latency and cost. |
