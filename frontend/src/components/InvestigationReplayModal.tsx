import React, { useState, useEffect } from "react";
import { Play, CheckCircle2, X, Zap } from "lucide-react";
import { ParitokMetrics, ReplayResponse } from "../types";

interface InvestigationReplayModalProps {
  isOpen?: boolean;
  onClose: () => void;
  metrics?: ParitokMetrics;
  query?: string;
  replayData?: ReplayResponse;
}

export const InvestigationReplayModal: React.FC<InvestigationReplayModalProps> = ({
  isOpen = true,
  onClose,
  metrics,
  query,
  replayData
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const displayMetrics = metrics || replayData?.metrics;
  const displayQuery = query || replayData?.question || "Show all failed SSH login spikes and root escalation commands";

  const defaultTraceSteps = [
    { step: 1, title: "1. Raw Evidence Retrieval", detail: "Indexed 1,500 security events from Linux Syslog & EVTX index" },
    { step: 2, title: "2. Evidence Pack Assembly", detail: "Structured IP entities (192.168.1.105), Accounts (admin, root), and temporal bounds" },
    { step: 3, title: "3. Paritok Context Optimization", detail: `Compressed raw payload from ${displayMetrics?.without_paritok.tokens.toLocaleString() || "88,974"} tokens down to ${displayMetrics?.with_paritok.tokens.toLocaleString() || "1,064"} tokens (${displayMetrics?.compression_ratio || "98.7"}% context reduction)` },
    { step: 4, title: "4. Groq Llama-3 Grounded Reasoning", detail: "Evaluated high-density compressed payload and generated grounded incident timeline & entity graph" }
  ];

  const traceSteps = replayData?.trace_steps || defaultTraceSteps;

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < traceSteps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [isOpen, traceSteps.length]);

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div className="panel-container" style={{ width: "100%", maxWidth: "680px", padding: "28px", border: "2px solid rgba(139, 92, 246, 0.5)", position: "relative" }}>
        {/* Close Button */}
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ background: "rgba(139, 92, 246, 0.2)", padding: "10px", borderRadius: "10px", color: "var(--accent-violet)" }}>
            <Play size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent-violet)" }} className="font-heading">
              INVESTIGATION REPLAY TRACE
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Step-by-step trace of how Paritok enabled ultra-fast reasoning over massive security contexts
            </p>
          </div>
        </div>

        {/* Question Banner */}
        <div className="panel-card" style={{ padding: "12px 16px", marginBottom: "20px", fontSize: "0.88rem", fontWeight: 600 }}>
          Query: <span style={{ color: "var(--accent-cyan)" }}>"{displayQuery}"</span>
        </div>

        {/* Step-by-Step Trace Animation List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {traceSteps.map((step, idx) => {
            const isVisible = idx <= activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={step.step}
                style={{
                  padding: "14px 16px",
                  borderRadius: "8px",
                  background: isCurrent ? "rgba(139, 92, 246, 0.15)" : (isVisible ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.02)"),
                  border: isCurrent ? "1px solid var(--accent-violet)" : (isVisible ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)"),
                  opacity: isVisible ? 1 : 0.4,
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
                <div style={{ color: isVisible ? "var(--accent-emerald)" : "var(--text-muted)" }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: isVisible ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {step.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paritok Compression Telemetry Highlight */}
        {displayMetrics && (
          <div style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))", padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.4)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-emerald)", fontWeight: 700, fontSize: "0.9rem" }}>
              <Zap size={18} />
              <span>PARITOK TELEMETRY IMPACT:</span>
            </div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }} className="font-mono">
              {displayMetrics.without_paritok.tokens.toLocaleString()} ➔ {displayMetrics.with_paritok.tokens.toLocaleString()} Tokens ({displayMetrics.compression_ratio}% Saved)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
