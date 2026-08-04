# Product Requirements Document (PRD)

# AI Security Investigation Platform

## Purpose

This document defines the functional requirements for the AI Security Investigation Platform.

It describes what the application must do, how users interact with it, and what features are required for the first production-ready version.

This document intentionally focuses on product behavior rather than implementation details.

---

# Problem Statement

Security analysts spend hours investigating incidents by manually searching through thousands or millions of log entries.

Traditional log viewers require technical knowledge and manual filtering.

Generic AI chat applications can answer questions about uploaded logs, but they:

- do not maintain investigation state
- repeatedly consume large contexts
- provide little visibility into token efficiency
- do not demonstrate why context compression matters

The platform solves these problems by combining structured log investigations with Paritok-powered context compression.

---

# Product Goals

The application should allow users to:

- Upload one or more log files.
- Automatically process uploaded logs.
- Search investigations using natural language.
- Continue an investigation across multiple questions.
- Receive evidence-backed answers.
- Visualize attack timelines.
- Clearly see how Paritok improves efficiency.

---

# Target Users

Primary Users

- Security Analysts
- SOC Teams
- Incident Responders

Secondary Users

- Cybersecurity Students
- Researchers
- Security Engineers

---

# Functional Requirements

## 1. Investigation Creation

Users should be able to create a new investigation.

Each investigation should contain:

- Investigation name
- Upload date
- Uploaded files
- Processing status
- Investigation history

---

## 2. Log Upload

Users should be able to upload one or more log files.

The application should:

- accept multiple files
- display upload progress
- validate supported formats
- reject corrupted uploads gracefully

The user should not need to manually specify log types.

---

## 3. Automatic Processing

After upload, the system should automatically:

- detect log formats
- extract events
- normalize event data
- prepare the investigation for searching

The user should only see processing progress.

---

## 4. Investigation Dashboard

Each investigation should have its own workspace.

The dashboard should display:

- uploaded files
- investigation status
- total events
- processing status
- recent questions
- investigation summary

---

## 5. AI Investigation Chat

Users interact with the investigation using natural language.

Example questions:

- What happened first?
- Which account was compromised?
- Show suspicious IP addresses.
- Explain the attack timeline.
- Why do you think this is malicious?
- Which evidence supports this answer?

The conversation should remain within the same investigation.

---

## 6. Evidence Panel

Every AI answer must include supporting evidence.

Evidence may include:

- related log events
- timestamps
- users
- IP addresses
- event descriptions

The system should avoid unsupported conclusions.

---

## 7. Timeline View

The application should generate a chronological timeline of important events.

Users should be able to understand the sequence of an attack without manually reading logs.

---

## 8. Paritok Metrics

Every AI response should display measurable efficiency metrics.

Examples include:

- Original context size
- Compressed context size
- Compression ratio
- Estimated token savings
- Estimated latency reduction
- Estimated cost reduction

These metrics are a core part of the product experience.

---

## 9. Investigation History

Every investigation should preserve:

- previous questions
- previous answers
- investigation timeline
- evidence history

Users should continue investigations without starting over.

---

# Non-Functional Requirements

The platform should be:

- responsive
- scalable
- modular
- easy to extend
- suitable for large investigations
- production quality

---

# MVP Scope

Version 1 should include:

✅ Investigation creation

✅ Log upload

✅ Automatic processing

✅ AI investigation chat

✅ Evidence panel

✅ Timeline generation

✅ Paritok metrics dashboard

---

# Out of Scope (Version 1)

The following features should NOT be implemented in the first version:

- User collaboration
- Real-time monitoring
- Live SIEM integration
- Automated threat response
- Malware analysis
- Alert generation
- Cloud deployment automation

These can be added in future versions.

---

# Success Criteria

The application is successful if a user can:

1. Upload log files.

2. Wait for processing.

3. Ask investigation questions.

4. Receive evidence-backed answers.

5. Understand the attack timeline.

6. Clearly see the efficiency improvements provided by Paritok.

The product should feel like a professional investigation platform rather than a generic AI chatbot.
