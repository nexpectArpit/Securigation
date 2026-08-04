# AI Security Investigation Platform
## Build with Paritok Hackathon

## Vision

Build an AI-powered Security Investigation Platform that allows users to upload security log files, investigate security incidents using natural language, and clearly demonstrate how Paritok enables efficient large-context reasoning.

This is **NOT** a chatbot.

This is **NOT** a generic "Chat with Logs" application.

It is an Investigation Workspace.

The application helps security analysts understand cyber incidents by transforming thousands (or millions) of log events into evidence-backed answers.

---

# Problem

When a cyber attack happens, investigators receive huge amounts of log data from multiple systems.

Examples include:

- Windows Event Logs
- Apache Logs
- Firewall Logs
- VPN Logs
- Authentication Logs
- Linux Syslogs

Reading these logs manually is extremely time consuming.

Even modern LLMs struggle because the investigation context becomes very large.

Every follow-up question requires sending almost the same context repeatedly.

This increases:

- token usage
- latency
- cost

The investigation becomes inefficient.

---

# Solution

The platform allows investigators to upload log files.

The system automatically:

- detects supported formats
- parses events
- normalizes events into one investigation model
- stores them
- retrieves relevant evidence
- compresses investigation context using Paritok
- asks an inexpensive LLM for reasoning
- returns evidence-backed answers

The platform must clearly demonstrate that Paritok is responsible for making large investigations practical.

---

# Target User

Primary User:

Security Analyst

Secondary Users:

- Incident Response Teams
- SOC Analysts
- Students learning cybersecurity
- Researchers

---

# Core User Journey

1. Upload security logs.

2. Wait while logs are processed.

3. Ask investigation questions in natural language.

Examples:

- Where did the attack begin?

- Which user account was compromised?

- Show me the attack timeline.

- Which IP looks suspicious?

- What evidence supports this conclusion?

4. Receive

- Answer

- Supporting Evidence

- Timeline

- Investigation Summary

- Paritok Metrics

---

# Product Philosophy

The hero of this application is NOT the LLM.

The hero is Paritok.

Every important AI query should flow through Paritok.

The application should visually prove that Paritok significantly reduces context size while maintaining investigation quality.

Judges should immediately understand why Paritok matters.

---

# Success Criteria

A successful demo should allow a judge to:

Upload logs.

Ask a question.

Watch Paritok compress the context.

See token savings.

See cost savings.

Receive an evidence-backed answer.

Understand that the application would be significantly slower and more expensive without Paritok.

---

# Scope

This project is intentionally focused on security investigations.

Although the architecture should remain modular, the first version should prioritize the cybersecurity workflow because it naturally produces large, repetitive contexts that best demonstrate Paritok.
