# Development Rules & Engineering Standards

# AI Security Investigation Platform

## Purpose

This document establishes the mandatory engineering standards, coding guidelines, structural conventions, and quality gates for the AI Security Investigation Platform.

---

# 1. Core Architectural Principles

- **Clean Architecture & Layer Separation**:
  - `Domain Layer`: Entities, Enums, Pure Value Objects (zero external framework dependencies).
  - `Application Layer`: Investigation Use Cases, Parser Interfaces, Pipeline Orchestration.
  - `Infrastructure Layer`: Database ORMs, Elasticsearch adapters, Paritok SDK client, LLM providers.
  - `Presentation Layer`: REST Controller routes, UI Components, State Stores.

- **Dependency Inversion**: High-level investigation workflows must depend on abstractions (interfaces), never concrete implementations.

---

# 2. Code Quality & Type Safety

- **Strict Type Checking**: All Python code must enforce static typing (`mypy --strict`). TypeScript frontend code must avoid `any`.
- **Domain Schema Immutability**: Normalized Security Event models must be immutable data structures (Pydantic `/ dataclass` with `frozen=True`).
- **Explicit Exception Handling**: No silent `except Exception: pass`. Catch specific domain exceptions and log with structured contextual metadata.

---

# 3. Logging & Observability Standards

- **Structured JSON Logging**: Every log statement must output structured JSON containing `timestamp`, `log_level`, `investigation_id`, `correlation_id`, and `component_name`.
- **Zero Sensitive Data Logging**: Unmasked credentials or secrets must never appear in application application logs.

---

# 4. Testing Requirements

- **Unit Tests**: Mandatory test suites for:
  - Every Log Parser (`Windows EVTX`, `Syslog`, `Apache`, `Generic`).
  - Event Normalization Mapping logic.
  - Query Entity Extraction routines.
- **Integration Tests**: Verification of candidate search retrieval from test indexes.
- **End-to-End Tests**: Complete execution of the `Upload -> Parse -> Search -> Paritok -> LLM` pipeline.

---

# 5. Documentation & Maintainability

- **API Documentation**: OpenAPI / Swagger schemas automatically synchronized with controller code.
- **Self-Documenting Code**: Explicit variable names (`normalized_event_count` over `n`).
