# UI/UX Specification

# AI Security Investigation Platform

## Purpose

This document defines the complete user experience design, interface layouts, interaction patterns, visual hierarchy, and dashboard components for the AI Security Investigation Platform.

The hero of the application UI is **Paritok Context Compression**. Every screen clearly demonstrates why context compression makes large-scale log investigations fast, cheap, and feasible.

---

# 1. Visual Aesthetics & Design System

- **Theme**: Dark Mode SOC (Security Operations Center) Command Center.
- **Color Palette**:
  - Background: Deep Slate / Obsidian (`#0F172A`, `#020617`)
  - Panels: Glassmorphic Translucent Surface (`rgba(30, 41, 59, 0.7)` with `backdrop-filter: blur(12px)`)
  - Accent / Primary Action: Cyber Cyan (`#06B6D4`)
  - Paritok Metric Hero Highlights: Emerald Green (`#10B981`)
  - Security Threat Alert: Crimson / Amber (`#EF4444` / `#F59E0B`)
- **Typography**: Inter / Outfit (Clean, modern sans-serif) + JetBrains Mono for log content & code snippets.

---

# 2. Main Workspace Layout Architecture

The application UI is structured as a split-pane Investigation Command Workspace:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo] AI Security Workspace  │ Inv: #RedLine-DC  │ 3 Files (14.2 MB)  │
├───────────────────┬──────────────────────────────────┬──────────────────┤
│ INVESTIGATION LOGS│      INVESTIGATION WORKSPACE     │ PARITOK METRICS  │
│                   │                                  │     HERO CARD    │
│ 📁 auth.log       │ 💬 Chat History & Reasoning      │ ┌──────────────┐ │
│ 📁 security.evtx  │                                  │ │ 84.2k -> 3.1k│ │
│ 📁 firewall.log   │ Q: "Which IP initiated bruteforce│ │ 96.3% Tokens │ │
│                   │    attack?"                      │ │ Saved ($0.16)│ │
│ ───────────────   │                                  │ └──────────────┘ │
│ STATS             │ A: Attack originated from IP...  │                  │
│ Total Events:     │ [Confidence: HIGH]               │ ATTACK TIMELINE  │
│ 142,500           │                                  │ ┌──────────────┐ │
│                   │ ─────────────                    │ │ 00:04 UTC    │ │
│                   │ 🔍 SUPPORTING EVIDENCE           │ │ Brute Force  │ │
│                   │ [Table of 4 Raw Log Lines]       │ │ 00:06 UTC    │ │
│                   │                                  │ │ Root Escal.  │ │
│                   │ ─────────────────────────────────│ └──────────────┘ │
│                   │ [Ask Question Input Box        ] │                  │
└───────────────────┴──────────────────────────────────┴──────────────────┘
```

---

# 3. Key UI Components & Interactions

### 3.1 Drag-and-Drop Ingestion Overlay
- Multi-file drop target with real-time format auto-detection badges (`EVTX`, `SYSLOG`, `APACHE`).
- Streaming progress bars displaying parsed events/sec and checksum validations.

### 3.2 Natural Language Investigation Console
- Prominent input console with auto-suggested security prompts (*"Show suspicious login spikes"*, *"Identify compromised accounts"*).
- Multi-turn investigation thread preserving past reasoning context.

### 3.3 Paritok Metrics Dashboard (The Hero Card)
- **Token Compression Bar**: Visual before-and-after bar showing raw context tokens (e.g., 84,200 tokens) vs. compressed tokens (e.g., 3,150 tokens).
- **Metric Badges**:
  - `96.3% Context Compression`
  - `Token Savings: 81,050`
  - `Cost Reduced: $0.16`
  - `Latency Reduced: 2.8s`
- **Pipeline Inspector Toggle**: Expandable visual node diagram showing the data path (`Query -> Search Engine -> Paritok -> LLM`).

### 3.4 Interactive Supporting Evidence Drawer
- Filterable data table displaying raw security logs corresponding to cited event IDs.
- Syntax highlighting for IP addresses, usernames, and timestamp fields.
- One-click copy/export of audit evidence snippets.

### 3.5 Chronological MITRE ATT&CK Timeline
- Interactive vertical timeline showing security milestones.
- Color-coded severity indicators (Critical, High, Medium).
- Clicking a timeline card auto-scrolls to the corresponding log evidence in the Evidence Table.

---

# 4. Responsive & Micro-Interaction Guidelines

- **Micro-Animations**: Smooth CSS transitions on Paritok compression counters (counting up from 0 to percentage saved).
- **Responsive Layout**: Main stage expands dynamically; sidebars collapse into toggleable side drawers on smaller screens.
- **Glassmorphism**: Crisp border highlights (`border: 1px solid rgba(255,255,255,0.1)`) with soft backdrop blurs.
