# Paritok Integration Specification

# AI Security Investigation Platform

## Purpose

This document defines how Paritok is integrated into the platform.

Paritok is not an implementation detail.

It is the core feature of the application.

Every important AI interaction should demonstrate the value of Paritok.

The application should make it obvious to users and judges that Paritok enables efficient investigation over very large contexts.

---

# Design Philosophy

Traditional AI applications work like this:

User Question

↓

Retrieve Context

↓

LLM

↓

Answer

This project intentionally inserts Paritok into the middle of that workflow.

User Question

↓

Retrieve Investigation Context

↓

Paritok Compression

↓

LLM

↓

Answer

The application should visually communicate this architecture.

---

# Why Paritok Exists

Security investigations contain large amounts of repetitive information.

Examples include:

- repeated authentication logs
- repeated network events
- repeated firewall records
- repeated process events
- repeated user activity

Sending all retrieved context to the LLM is expensive and inefficient.

Paritok reduces the amount of context while preserving the information needed for reasoning.

The platform exists to demonstrate this improvement.

---

# Paritok Responsibilities

Paritok is responsible for:

- compressing retrieved investigation context
- reducing repeated information
- lowering token usage
- reducing latency
- reducing LLM cost
- improving scalability

Paritok should never be bypassed during AI investigations.

---

# Integration Workflow

Every investigation question follows this sequence:

1. User asks a question.

2. Retrieval engine finds relevant events.

3. Retrieved events become the investigation context.

4. Investigation context is sent to Paritok.

5. Paritok compresses the context.

6. Compressed context is forwarded to the LLM.

7. LLM generates an evidence-backed answer.

---

# Metrics Dashboard

Every investigation response should display measurable Paritok statistics.

Examples include:

Original Context Size

Compressed Context Size

Compression Ratio

Estimated Token Savings

Estimated Latency Reduction

Estimated Cost Reduction

These metrics should be visible without requiring user interaction.

They are a core part of the product.

---

# Before and After Comparison

The application should visually compare:

Without Paritok

- Large context
- Higher token usage
- Higher cost
- Higher latency

With Paritok

- Smaller context
- Lower token usage
- Lower cost
- Faster reasoning

This comparison should be understandable even to users unfamiliar with AI systems.

---

# Investigation Transparency

Users should understand what happened during every query.

The application should present the investigation pipeline visually.

Question

↓

Retrieved Events

↓

Paritok Compression

↓

Compressed Context

↓

LLM Reasoning

↓

Answer

↓

Evidence

This increases transparency and highlights the role of Paritok.

---

# User Experience Goals

The user should never wonder whether Paritok is being used.

Every investigation should make its contribution visible.

The interface should educate users about:

- why compression matters
- how much context was reduced
- why the answer was generated efficiently

---

# Performance Goals

The application should optimize for:

- efficient context processing
- low latency
- reduced token consumption
- scalable investigations

Paritok is the primary mechanism used to achieve these goals.

---

# Hackathon Goal

Judges should immediately understand:

Without Paritok

Large investigations become expensive and inefficient.

With Paritok

The same investigation becomes practical using inexpensive language models.

The platform should communicate this message clearly through both architecture and user interface.

---

# Future Extensibility

The Paritok layer should remain independent from:

- the parser
- the storage engine
- the retrieval engine
- the LLM provider

This allows future replacement of individual components without affecting the overall architecture.

Paritok should always remain the dedicated context optimization layer within the investigation pipeline.
