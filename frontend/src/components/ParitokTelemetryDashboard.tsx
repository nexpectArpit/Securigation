"use client";

import React, { useEffect, useRef, useState } from "react";
import { ParitokMetrics } from "../types";

interface ParitokTelemetryDashboardProps {
  currentMetrics?: ParitokMetrics;
  historicalMetrics?: ParitokMetrics[];
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  tooltip: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, tooltip }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: hovered ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? "rgba(0, 245, 200, 0.22)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "12px",
        padding: "16px",
        cursor: "default",
        transition: "all 0.25s ease-in-out",
        minHeight: "165px",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!hovered ? (
        <div 
          className="fade-in-el"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <div>
            <div style={{ fontSize: "0.72rem", color: "rgba(180,180,200,0.65)", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "4px" }}>
              {label.toUpperCase()}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(140,140,160,0.55)" }}>{sub}</div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", fontFamily: "monospace", lineHeight: 1, marginTop: "12px" }}>{value}</div>
        </div>
      ) : (
        <div 
          className="fade-in-el"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <div>
            <div style={{ fontSize: "0.6rem", color: "#a78bfa", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "4px" }}>
              WHAT THIS IS
            </div>
            <div style={{
              fontSize: "0.72rem",
              color: "rgba(210,210,230,0.9)",
              lineHeight: 1.45,
            }}>
              {tooltip}
            </div>
          </div>
          <div style={{
            fontSize: "0.76rem",
            fontWeight: 800,
            color: "#00f5c8",
            fontFamily: "monospace",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "6px",
            marginTop: "8px",
          }}>
            {value}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Compression ring (SVG donut) ─────────────────────────────────────────────
const CompressionRing: React.FC<{ ratio: number; label: string }> = ({ ratio, label }) => {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const filled = circ * (ratio / 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#00f5c8" />
          </linearGradient>
        </defs>
        <text x="44" y="47" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="monospace">
          {ratio.toFixed(0)}%
        </text>
      </svg>
      <div style={{ fontSize: "0.68rem", color: "rgba(150,150,170,0.6)", textAlign: "center" }}>{label}</div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const ParitokTelemetryDashboard: React.FC<ParitokTelemetryDashboardProps> = ({
  currentMetrics,
  historicalMetrics = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredBar, setHoveredBar] = useState<{ queryIdx: number; type: "raw" | "saved" } | null>(null);
  const allMetrics = historicalMetrics.length > 0 ? historicalMetrics : currentMetrics ? [currentMetrics] : [];

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || allMetrics.length < 1) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padL = 44, padR = 12, padT = 16, padB = 30;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    const cW = W - padL - padR;
    const cH = H - padT - padB;

    const maxT = Math.max(...allMetrics.map(m => m.without_paritok.tokens), 1);
    const n = allMetrics.length;
    const groupW = cW / n;
    const barW = Math.min(groupW * 0.28, 16);
    const gap = barW * 0.5;

    let found: { queryIdx: number; type: "raw" | "saved" } | null = null;

    for (let i = 0; i < n; i++) {
      const m = allMetrics[i];
      const cx = padL + (i + 0.5) * groupW;

      // Raw bar bounding check
      const procH = (m.without_paritok.tokens / maxT) * cH;
      const procX = cx - gap / 2 - barW;
      const procY = padT + cH - procH;
      if (x >= procX && x <= procX + barW && y >= procY && y <= padT + cH) {
        found = { queryIdx: i, type: "raw" };
        break;
      }

      // Saved bar bounding check
      const savH = (m.tokens_saved / maxT) * cH;
      const savX = cx + gap / 2;
      const savY = padT + cH - savH;
      if (x >= savX && x <= savX + barW && y >= savY && y <= padT + cH) {
        found = { queryIdx: i, type: "saved" };
        break;
      }
    }

    setHoveredBar(found);
  };

  // Grouped bar chart: tokens processed (gray) vs tokens saved (purple) per query
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || allMetrics.length < 1) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const padL = 44, padR = 12, padT = 16, padB = 30;
    const cW = W - padL - padR;
    const cH = H - padT - padB;

    ctx.clearRect(0, 0, W, H);

    const maxT = Math.max(...allMetrics.map(m => m.without_paritok.tokens), 1);

    // Grid
    for (let i = 0; i <= 4; i++) {
      const y = padT + (i / 4) * cH;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y);
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1; ctx.stroke();
      const val = Math.round(maxT * (1 - i / 4));
      ctx.fillStyle = "rgba(150,150,170,0.5)"; ctx.font = "10px monospace"; ctx.textAlign = "right";
      ctx.fillText(val >= 1000 ? `${(val / 1000).toFixed(0)}K` : String(val), padL - 6, y + 4);
    }

    const n = allMetrics.length;
    const groupW = cW / n;
    const barW = Math.min(groupW * 0.28, 16);
    const gap = barW * 0.5;

    allMetrics.forEach((m, i) => {
      const cx = padL + (i + 0.5) * groupW;
      // processed bar
      const procH = (m.without_paritok.tokens / maxT) * cH;
      const procX = cx - gap / 2 - barW;
      const procY = padT + cH - procH;
      const g1 = ctx.createLinearGradient(0, procY, 0, padT + cH);
      g1.addColorStop(0, "rgba(160,160,175,0.65)"); g1.addColorStop(1, "rgba(160,160,175,0.1)");
      ctx.beginPath(); ctx.roundRect(procX, procY, barW, procH, [3, 3, 0, 0]);
      ctx.fillStyle = g1; ctx.fill();

      // saved bar
      const savH = (m.tokens_saved / maxT) * cH;
      const savX = cx + gap / 2;
      const savY = padT + cH - savH;
      const g2 = ctx.createLinearGradient(0, savY, 0, padT + cH);
      g2.addColorStop(0, "#a78bfa"); g2.addColorStop(1, "rgba(139,92,246,0.15)");
      ctx.beginPath(); ctx.roundRect(savX, savY, barW, savH, [3, 3, 0, 0]);
      ctx.fillStyle = g2; ctx.fill();

      // labels (only visible on hover over specific bar)
      ctx.font = "10px monospace"; ctx.textAlign = "center";
      
      const isRawHovered = hoveredBar && hoveredBar.queryIdx === i && hoveredBar.type === "raw";
      if (isRawHovered) {
        ctx.fillStyle = "rgba(220,220,240,0.95)";
        const pl = m.without_paritok.tokens >= 1000 ? `${(m.without_paritok.tokens / 1000).toFixed(1)}K` : String(m.without_paritok.tokens);
        ctx.fillText(pl, procX + barW / 2, procY - 6);
      }

      const isSavedHovered = hoveredBar && hoveredBar.queryIdx === i && hoveredBar.type === "saved";
      if (isSavedHovered) {
        ctx.fillStyle = "#c084fc";
        const sl = m.tokens_saved >= 1000 ? `${(m.tokens_saved / 1000).toFixed(1)}K` : String(m.tokens_saved);
        ctx.fillText(sl, savX + barW / 2, savY - 6);
      }

      ctx.fillStyle = "rgba(150,150,170,0.55)"; ctx.textAlign = "center";
      ctx.fillText(`Q${i + 1}`, cx, padT + cH + 18);
    });
  }, [allMetrics.length, currentMetrics, hoveredBar]);

  if (!currentMetrics) {
    return (
      <div style={{
        padding: "32px", background: "rgba(10,16,28,0.55)",
        border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px",
        marginBottom: "20px", textAlign: "center",
        color: "rgba(150,150,170,0.55)", fontSize: "0.85rem",
      }}>
        Paritok telemetry will appear after your first query
      </div>
    );
  }

  const isActive = currentMetrics.status === "ACTIVE";
  const totalQ = allMetrics.length;
  const totalProcessed = allMetrics.reduce((s, m) => s + m.without_paritok.tokens, 0);
  const totalSaved = allMetrics.reduce((s, m) => s + m.tokens_saved, 0);
  const totalCost = allMetrics.reduce((s, m) => s + m.cost_saved_usd, 0);
  const ratio = totalProcessed > 0 ? (totalSaved / totalProcessed) * 100 : 0;

  const w = currentMetrics.without_paritok;
  const p = currentMetrics.with_paritok;

  const statCards = [
    {
      label: "Compression requests",
      value: String(totalQ),
      sub: "this session",
      tooltip: "Number of queries Paritok has optimized this session. Each question you ask triggers one compression round-trip.",
    },
    {
      label: "Tokens processed",
      value: totalProcessed >= 1000 ? `${(totalProcessed / 1000).toFixed(1)}K` : String(totalProcessed),
      sub: "input tokens",
      tooltip: "Total raw log tokens sent to Paritok across all queries. Without compression these would go directly to the LLM, often exceeding context limits.",
    },
    {
      label: "Tokens saved",
      value: totalSaved >= 1000 ? `${(totalSaved / 1000).toFixed(1)}K` : String(totalSaved),
      sub: `ratio ${(ratio / 100).toFixed(3)}`,
      tooltip: "Tokens eliminated by Paritok. The difference between raw input and what actually reaches the LLM. Fewer tokens means faster response and lower cost.",
    },
    {
      label: "Est. cost saved",
      value: `$${totalCost.toFixed(4)}`,
      sub: "active session",
      tooltip: "Dollar savings on LLM inference (Groq Llama-3, $0.05 per 1M tokens). Compounds significantly across many SOC analyst queries per day.",
    },
  ];

  return (
    <div style={{
      background: "rgba(8,13,24,0.75)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "20px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "0.68rem", color: "rgba(150,150,170,0.6)", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: "3px" }}>
            PARITOK CONTEXT ENGINE
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>Compression Analytics</div>
          <div style={{ fontSize: "0.65rem", color: "rgba(150,150,170,0.4)", marginTop: "2px" }}>Hover cards to understand each metric</div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: isActive ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${isActive ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
          borderRadius: "20px", padding: "5px 12px",
          fontSize: "0.72rem", color: isActive ? "#4ade80" : "#f87171", fontFamily: "monospace",
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: isActive ? "#4ade80" : "#f87171",
            boxShadow: isActive ? "0 0 6px #4ade80" : "0 0 6px #f87171",
          }} />
          {isActive ? "Engine Active" : "Disconnected"}
        </div>
      </div>

      {/* 4 stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {statCards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Bar chart */}
      <div style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px", padding: "16px", marginBottom: "20px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>
              Usage · last {allMetrics.length} {allMetrics.length === 1 ? "query" : "queries"}
            </div>
            <div style={{ fontSize: "0.67rem", color: "rgba(150,150,170,0.55)" }}>
              Tokens processed vs. tokens saved per query
            </div>
          </div>
          <div style={{ display: "flex", gap: "14px" }}>
            {[{ c: "rgba(160,160,175,0.65)", l: "Processed" }, { c: "#a78bfa", l: "Saved" }].map(x => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.7rem", color: "rgba(180,180,200,0.75)" }}>
                <div style={{ width: 11, height: 11, background: x.c, borderRadius: 3 }} />
                {x.l}
              </div>
            ))}
          </div>
        </div>
        <canvas ref={canvasRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredBar(null)} style={{ width: "100%", height: "150px", display: "block", cursor: hoveredBar ? "pointer" : "default" }} />
      </div>

      {/* Compression breakdown: ring + stacked bar side by side */}
      <div style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px", padding: "18px",
      }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(200,200,220,0.8)", marginBottom: "16px" }}>
          CONTEXT COMPRESSION BREAKDOWN: LAST QUERY
        </div>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {/* Ring */}
          <CompressionRing key={currentMetrics.compression_ratio} ratio={currentMetrics.compression_ratio} label="Tokens eliminated" />

          {/* Stacked visual for each metric */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "Log events", before: w.events, after: p.events, unit: "" },
              { label: "Tokens", before: w.tokens, after: p.tokens, unit: "" },
              { label: "LLM cost", before: w.cost_usd, after: p.cost_usd, unit: "$", decimals: 5 },
              { label: "Latency", before: w.latency_sec, after: p.latency_sec, unit: "s", decimals: 2 },
            ].map(row => {
              const pct = (row.after / Math.max(row.before, 0.0001)) * 100;
              const fmt = (v: number) => {
                const valStr = row.decimals ? v.toFixed(row.decimals) : v.toLocaleString();
                return row.unit === "$" ? `$${valStr}` : `${valStr}${row.unit}`;
              };
              return (
                <div key={row.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "rgba(170,170,190,0.7)", marginBottom: "4px" }}>
                    <span>{row.label}</span>
                    <span style={{ fontFamily: "monospace", color: "rgba(200,200,220,0.8)" }}>
                      <span style={{ color: "rgba(150,150,170,0.55)", textDecoration: "line-through", marginRight: "6px" }}>{fmt(row.before)}</span>
                      <span style={{ color: "#00f5c8" }}>{fmt(row.after)}</span>
                    </span>
                  </div>
                  {/* Stacked bar: gray = full, cyan overlay = after */}
                  <div style={{ position: "relative", height: "6px", background: "rgba(239,68,68,0.25)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: `${Math.max(pct, 0.5)}%`,
                      background: "linear-gradient(90deg, #00f5c8, #06b6d4)",
                      borderRadius: "3px",
                      transition: "width 0.7s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saving labels */}
        <div style={{ display: "flex", gap: "16px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { label: "Events cut", value: `${w.events - p.events}`, color: "#f87171" },
            { label: "Tokens saved", value: currentMetrics.tokens_saved >= 1000 ? `${(currentMetrics.tokens_saved / 1000).toFixed(1)}K` : String(currentMetrics.tokens_saved), color: "#a78bfa" },
            { label: "Cost delta", value: `$${currentMetrics.cost_saved_usd.toFixed(5)}`, color: "#fbbf24" },
            { label: "Speed gain", value: `${currentMetrics.latency_saved_sec.toFixed(2)}s`, color: "#4ade80" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
              <div style={{ fontSize: "0.65rem", color: "rgba(150,150,170,0.55)", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
