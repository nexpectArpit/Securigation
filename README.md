# AI Security Investigation Platform

[![Built with Paritok](https://img.shields.io/badge/Built%20with-Paritok-1f2d3d)](https://github.com/Paritok-official/paritok-4b-v1)

Built with [Paritok](https://github.com/Paritok-official/paritok-4b-v1) Hackathon Edition

An AI powered security investigation platform that transforms massive security log files into evidence backed incident answers. Powered by Paritok Context Optimization for high token efficiency, reduced cost, and low latency.

---

## Features

- Paritok Context Optimization: Reduces context token payload sizes by 85% to 98% while maintaining security evidence quality.
- Evidence Pack Pipeline: Search -> Evidence Pack -> Paritok -> Groq -> Grounded Response.
- Interactive Investigation Graph: Visual node-edge entity graph (IPs, Users, Hosts, Files, C2 Servers) with click-to-filter mechanics.
- 🎯 Judge Mode (Default): Clean, distraction-free 3-minute hackathon demo workspace.
- ▶ Replay Investigation: Step-by-step trace animation showing how Paritok enabled the reasoning pipeline.
- 1-Click Pre-loaded Demo Datasets: Load incident scenarios (APT29 SSH Brute Force, Apache WebShell, Windows Lateral Movement) in 30 seconds.
- Paritok Telemetry Hero Card: Side-by-side comparison of raw context vs optimized context (Events, Tokens, Cost, Latency).

---

## Environment Variables & API Keys

Add your API keys inside `backend/.env`:

```env
# Paritok API Key Configuration
PARITOK_API_KEY=your_paritok_api_key_here

# Groq LLM API Key Configuration
GROQ_API_KEY=your_groq_api_key_here

# Groq Model Selection
GROQ_MODEL=llama-3.3-70b-versatile
```

---

## Quick Start

### 1. Simple Backend Launch (Terminal 1)

From the project root folder:

```bash
python run_backend.py
```

*API will be running on: http://127.0.0.1:8000*

---

### 2. Frontend Launch (Terminal 2)

From the project root folder:

```bash
cd frontend
npm run dev
```

*Web UI will be running on: http://localhost:3000*

---

## Running Automated Tests

To run the backend test suite:

```bash
python -m pytest backend/tests/
```

To build the frontend production bundle:

```bash
cd frontend
npm run build
```

---

## Project Structure

- `run_backend.py`: Simple 1-line Python backend launcher script.
- `backend/`: FastAPI Python application (Parsers, Search Engine, Evidence Pack, Paritok Client, Groq Reasoning Engine, Sample Datasets).
- `frontend/`: Next.js React application (SOC Command UI, Paritok Telemetry Hero Card, Interactive Graph, Replay Modal).
- `sample_logs/`: Realistic security log files across 5 formats (Windows EVTX, Linux Syslog, Apache, Firewall, AWS CloudTrail).
- `docs/`: Master specifications, Architecture decisions, PRD, and Technical Design Document (TDD).
