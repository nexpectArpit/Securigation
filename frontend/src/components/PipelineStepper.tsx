import React, { useEffect, useRef, useState } from "react";
import { Cpu, Terminal, Info, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

interface PipelineStepperProps {
  currentStep: "IDLE" | "RETRIEVAL" | "EVIDENCE_PACK" | "PARITOK" | "GROQ" | "COMPLETE";
  rawCount?: number;
  compressedCount?: number;
  compressionRatio?: number;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  currentStep,
  rawCount = 0,
  compressedCount = 0,
  compressionRatio = 0,
}) => {
  const [localStepIndex, setLocalStepIndex] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeCursor, setActiveCursor] = useState<boolean>(true);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState<boolean>(false);

  // Stable refs so timers always read latest prop values without needing re-registration
  const rawRef = useRef(rawCount);
  const compRef = useRef(compressedCount);
  const ratioRef = useRef(compressionRatio);
  rawRef.current = rawCount;
  compRef.current = compressedCount;
  ratioRef.current = compressionRatio;

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setActiveCursor(p => !p), 500);
    return () => clearInterval(id);
  }, []);

  // Run log sequence whenever currentStep transitions to non-IDLE
  // Use a runId ref so if the user fires a new query before the old sequence finishes,
  // we cancel all pending timers and restart fresh — no more crashes.
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isRunningRef = useRef<boolean>(false);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    if (currentStep === "IDLE") {
      clearTimers();
      setLocalStepIndex(0);
      setTerminalLogs([]);
      setIsConsoleExpanded(false);
      return;
    }

    // Only start the logging animation when the query begins (RETRIEVAL phase)
    // When currentStep transitions to COMPLETE, do not touch or restart the running timers.
    if (currentStep !== "RETRIEVAL") {
      return;
    }

    // Reset and expand for new run
    clearTimers();
    setTerminalLogs([]);
    setLocalStepIndex(0);
    setIsConsoleExpanded(true);

    // Build the sequence lazily using refs so values are always fresh and safe from undefined/null
    const sequence: Array<{ delay: number; stepIdx: number; log: () => string }> = [
      {
        delay: 0,
        stepIdx: 0,
        log: () => `[INGESTION] Initializing parser for raw security event logs...`,
      },
      {
        delay: 380,
        stepIdx: 0,
        log: () => `[INGESTION] Detecting log format: syslog RFC 3164 / Windows EVTX / Apache Access...`,
      },
      {
        delay: 900,
        stepIdx: 1,
        log: () => `[INGESTION] Normalized ${(rawRef.current ?? 0).toLocaleString()} raw events into structured JSON.`,
      },
      {
        delay: 1300,
        stepIdx: 1,
        log: () => `[RETRIEVAL] BM25 + entity-weighted search across ${(rawRef.current ?? 0).toLocaleString()} indexed events...`,
      },
      {
        delay: 1800,
        stepIdx: 2,
        log: () => `[PARITOK] Transmitting evidence pack to Paritok Context Optimization Engine...`,
      },
      {
        delay: 2500,
        stepIdx: 2,
        log: () =>
          `⚡ [PARITOK] Compression complete: ${(rawRef.current ?? 0).toLocaleString()} events → ${(compRef.current ?? 0).toLocaleString()} high-density events (${ratioRef.current ?? 0}% reduction)`,
      },
      {
        delay: 3100,
        stepIdx: 3,
        log: () => `[REASONING] Sending ${(compRef.current ?? 0).toLocaleString()} compressed events to Groq Llama-3-70B...`,
      },
      {
        delay: 3700,
        stepIdx: 3,
        log: () => `[REASONING] Extracting threat entities, attack graph nodes, and timeline markers...`,
      },
      {
        delay: 4300,
        stepIdx: 4,
        log: () =>
          `✔ [COMPLETE] Answer generated. ${(compRef.current ?? 0).toLocaleString()} evidence events used. Context saved: ${ratioRef.current ?? 0}%.`,
      },
    ];

    const ids = sequence.map(({ delay, stepIdx, log }) =>
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, log()]);
        setLocalStepIndex(stepIdx);
      }, delay)
    );

    timersRef.current = ids;

    return () => clearTimers();
    // Only re-run when currentStep changes — NOT on rawCount/compressedCount changes
    // (values are read via refs at fire time)
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  if (currentStep === "IDLE") return null;

  const isComplete = localStepIndex >= 4;

  return (
    <div
      className="panel-minimal"
      style={{
        padding: "18px 24px",
        marginBottom: "28px",
        border: "1px solid var(--border-teal)",
        background: "rgba(10, 16, 28, 0.45)",
        borderRadius: "10px",
      }}
    >
      {/* Status bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: isComplete ? "rgba(0,245,200,0.12)" : "rgba(6,182,212,0.12)",
            border: isComplete ? "1px solid rgba(0,245,200,0.3)" : "1px solid rgba(6,182,212,0.3)",
            padding: "8px", borderRadius: "50%",
            color: isComplete ? "#00f5c8" : "#06b6d4",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isComplete ? <CheckCircle size={18} /> : <Cpu size={18} className="animate-spin-slow" />}
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff" }}>
              {isComplete
                ? "Paritok Engine Ingestion & Context Compression Complete"
                : "Processing Security Log Telemetry Pipeline..."}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }} className="font-mono">
              {rawCount > 0
                ? `${rawCount.toLocaleString()} raw events → ${compressedCount.toLocaleString()} optimized events (${compressionRatio}% context reduction)`
                : "Awaiting pipeline data..."}
            </div>
          </div>
        </div>
      </div>

      {/* Terminal logs panel - always expanded */}
      <div style={{
          background: "rgba(5,7,12,0.95)",
          border: "1px solid var(--border-cyan)",
          borderRadius: "8px",
          padding: "16px",
          marginTop: "16px",
          animation: "slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "12px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "8px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00f5c8", fontSize: "0.78rem", fontWeight: 700 }} className="font-mono">
              <Terminal size={16} />
              <span>PARITOK ENGINE CONTEXT PIPELINE TRACE LOGS</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }} className="font-mono">
              telemetry_stream.log
            </div>
          </div>

          <div style={{ fontSize: "0.78rem", display: "flex", flexDirection: "column", gap: "8px" }} className="font-mono">
            {terminalLogs.map((log, i) => {
              let color = "#00f5c8";
              let weight: React.CSSProperties["fontWeight"] = "normal";
              if (log.includes("[INGESTION]")) color = "rgba(0,245,200,0.8)";
              else if (log.includes("[RETRIEVAL]")) color = "rgba(139,92,246,0.9)";
              else if (log.includes("[PARITOK]")) color = "#06b6d4";
              else if (log.includes("⚡")) { color = "#00f5c8"; weight = "bold"; }
              else if (log.includes("[REASONING]")) color = "#f59e0b";
              else if (log.includes("✔")) { color = "#00f5c8"; weight = "bold"; }
              return (
                <div key={i} style={{ color, fontWeight: weight }}>{log}</div>
              );
            })}

            {localStepIndex < 4 && (
              <div style={{ color: "#06b6d4", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>&gt;_</span>
                <span style={{
                  display: "inline-block", width: "6px", height: "12px",
                  background: "#06b6d4", opacity: activeCursor ? 1 : 0,
                }} />
              </div>
            )}
          </div>
        </div>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
