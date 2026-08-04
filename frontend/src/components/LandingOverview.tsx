import React, { useState, useEffect, useRef } from "react";
import { ArrowDownRight, Zap, Database, Layers, Cpu, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Terminal, FileCode, Lock } from "lucide-react";
import { InvestigationInfo } from "../types";

interface LandingOverviewProps {
  samples: InvestigationInfo[];
  onLaunchWorkspace: () => void;
  onSelectSample: (sample: InvestigationInfo) => void;
}



export const LandingOverview: React.FC<LandingOverviewProps> = ({
  samples,
  onLaunchWorkspace,
  onSelectSample
}) => {
  const animatedRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Interactive Sandbox Simulator states
  const [selectedFormat, setSelectedFormat] = useState<"SSH" | "APACHE" | "WINDOWS">("SSH");
  const [isCompressing, setIsCompressing] = useState(false);
  const [hasCompressed, setHasCompressed] = useState(false);
  const [activeLogPreview, setActiveLogPreview] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("appear");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    animatedRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const sandboxLogs = {
    SSH: {
      title: "Linux SSH logs (15,000 raw lines)",
      raw: [
        "2026-07-31T00:01:02Z linux-sec-node sshd[102]: Failed password for invalid user root from 192.168.1.105 port 49152 ssh2",
        "2026-07-31T00:01:03Z linux-sec-node sshd[103]: Failed password for invalid user root from 192.168.1.105 port 49153 ssh2",
        "2026-07-31T00:01:04Z linux-sec-node sshd[104]: Failed password for user admin from 192.168.1.105 port 49154 ssh2",
        "2026-07-31T00:01:05Z linux-sec-node sshd[105]: Failed password for invalid user root from 192.168.1.105 port 49155 ssh2",
        "2026-07-31T00:02:10Z linux-sec-node sshd[222]: Failed password for user root from 192.168.1.105 port 49156 ssh2",
        "2026-07-31T00:03:15Z linux-sec-node sshd[240]: Failed password for user root from 192.168.1.105 port 49157 ssh2",
        "2026-07-31T00:04:12Z linux-sec-node sshd[4122]: Accepted password for admin from 192.168.1.105 port 49200 ssh2",
        "2026-07-31T00:05:30Z linux-sec-node sudo: admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash",
        "2026-07-31T00:06:10Z linux-sec-node scp[4210]: Uploading shadow.bak to 185.17.42.109:443"
      ],
      compressed: [
        "🔥 [BRUTEFORCE_SPIKE] 9 failed authentications detected from 192.168.1.105 targeting root & admin.",
        "🟢 [AUTH_SUCCESS] Successful login for user admin from 192.168.1.105.",
        "⚠️ [PRIVILEGE_ESCALATION] sudo execution: admin spawned interactive root shell (/bin/bash).",
        "🚨 [EXFILTRATION] Outbound copy of security backups (shadow.bak) to remote C2 185.17.42.109."
      ],
      rawMetrics: { tokens: 57120, latency: 12.4, cost: 0.45 },
      compMetrics: { tokens: 750, latency: 0.38, cost: 0.005, reduction: "98.7%" }
    },
    APACHE: {
      title: "Apache Web Access logs (10,000 raw lines)",
      raw: [
        '198.51.100.44 - - [31/Jul/2026:01:10:02 +0000] "GET /admin/login.php HTTP/1.1" 404 512',
        '198.51.100.44 - - [31/Jul/2026:01:10:15 +0000] "GET /admin/wp-login.php HTTP/1.1" 404 512',
        '198.51.100.44 - - [31/Jul/2026:01:10:30 +0000] "GET /admin/index.php HTTP/1.1" 404 512',
        '198.51.100.44 - - [31/Jul/2026:01:10:45 +0000] "POST /upload.php HTTP/1.1" 200 4096',
        '198.51.100.44 - - [31/Jul/2026:01:11:15 +0000] "GET /uploads/shell.php?cmd=whoami HTTP/1.1" 200 128',
        '198.51.100.44 - - [31/Jul/2026:01:11:30 +0000] "GET /uploads/shell.php?cmd=cat+/etc/passwd HTTP/1.1" 200 2048',
        '198.51.100.44 - - [31/Jul/2026:01:12:00 +0000] "POST /uploads/shell.php HTTP/1.1" 500 1024'
      ],
      compressed: [
        "🔍 [RECONNAISSANCE] Port scan / URL directory enumeration targeting admin panels from 198.51.100.44.",
        "📤 [WEBSHELL_UPLOAD] File upload script upload.php accessed via POST returning HTTP 200.",
        "💀 [RCE] Executed system commands (whoami, cat /etc/passwd) using uploaded webshell script shell.php.",
        "🛑 [SYSTEM_CRASH] Exploit payload crashed the webshell handler process (HTTP 500)."
      ],
      rawMetrics: { tokens: 38240, latency: 9.2, cost: 0.32 },
      compMetrics: { tokens: 680, latency: 0.28, cost: 0.003, reduction: "98.2%" }
    },
    WINDOWS: {
      title: "Windows Security EVTX logs (20,000 raw lines)",
      raw: [
        "EventID: 4625 | ComputerName: DC-01.corp.internal | LogonType: 3 | Account Name: Administrator | Source Network Address: 10.0.4.15",
        "EventID: 4625 | ComputerName: DC-01.corp.internal | LogonType: 3 | Account Name: Administrator | Source Network Address: 10.0.4.15",
        "EventID: 4672 | ComputerName: DC-01.corp.internal | Account Name: S-1-5-21 | Privileges: SeDebugPrivilege",
        "EventID: 4624 | ComputerName: DC-01.corp.internal | LogonType: 10 (RDP) | Account Name: Administrator | Source Network Address: 10.0.4.15",
        "EventID: 7045 | ComputerName: DC-01.corp.internal | Service Name: PwDump | Service Type: user mode service",
        "EventID: 1102 | ComputerName: DC-01.corp.internal | Audit Log Cleared by Account: Administrator"
      ],
      compressed: [
        "🔑 [RDP_BRUTEFORCE] Failed remote network authentications (ID 4625) from 10.0.4.15 targeting Administrator.",
        "🛠️ [PRIVILEGE_ASSIGNED] Debug privileges (SeDebugPrivilege) assigned to target Administrator session (ID 4672).",
        "💀 [LATERAL_MOVEMENT] Successful remote desktop login session established (ID 4624) from origin host 10.0.4.15.",
        "🚫 [LOG_TAMPERING] System audit event log database explicitly wiped clean (ID 1102) to destroy forensics."
      ],
      rawMetrics: { tokens: 49120, latency: 10.8, cost: 0.40 },
      compMetrics: { tokens: 590, latency: 0.25, cost: 0.002, reduction: "98.8%" }
    }
  };

  const handleFormatSelect = (format: "SSH" | "APACHE" | "WINDOWS") => {
    setSelectedFormat(format);
    setHasCompressed(false);
    setIsCompressing(false);
  };

  const runCompressionSimulation = () => {
    setIsCompressing(true);
    setHasCompressed(false);
    setTimeout(() => {
      setIsCompressing(false);
      setHasCompressed(true);
    }, 1200);
  };

  const storySteps = [
    {
      step: "CHAPTER 01",
      tag: "THE INCIDENT INGESTION CRISIS",
      title: "The Storm of Uncompressed Security Logs",
      description:
        "Modern SOC teams are inundated with gigabytes of daily security log streams from domain controllers, Apache webservers, firewalls, and cloud infra. A single APT29 brute-force attack or webshell upload generates tens of thousands of raw lines. Ingesting this uncompressed data directly into LLMs causes severe latency, multi-dollar token costs, and context truncation.",
      icon: Database,
      accent: "#00f5c8",
      side: "reveal-left"
    },
    {
      step: "CHAPTER 02",
      tag: "PARITOK CONTEXT COMPRESSION",
      title: "High-Density Context Compression Engine",
      description:
        "Securigation integrates directly with the official hosted Paritok /api/compress API. Instead of sending 15,000 redundant log lines to the AI model, Paritok strips noise while preserving 100% of critical security telemetry, achieving a 98.7% token reduction in under 400 milliseconds.",
      icon: Layers,
      accent: "#06b6d4",
      side: "reveal-right"
    },
    {
      step: "CHAPTER 03",
      tag: "GROQ SUB-SECOND REASONING",
      title: "Sub-Second Grounded AI Threat Evaluation",
      description:
        "The optimized high-density context is processed by Groq Llama-3 70B in under 1 second. Rather than guessing, the LLM evaluates exact failed login volume spikes, root privilege escalations, webshell payloads, and Mimikatz privilege assignments to deliver hallucination-free grounded findings.",
      icon: Cpu,
      accent: "#f59e0b",
      side: "reveal-left"
    },
    {
      step: "CHAPTER 04",
      tag: "DYNAMIC SOC THREAT GRAPH",
      title: "Interactive Entity Graph & Timeline Replay",
      description:
        "Securigation automatically constructs interactive node relationships between attacker IPs, compromised domain accounts, target hostnames, and command execution timelines, allowing SOC analysts to filter and inspect evidence records in real-time.",
      icon: ShieldCheck,
      accent: "#00f5c8",
      side: "reveal-right"
    }
  ];

  const currentSandbox = sandboxLogs[selectedFormat];

  return (
    <div style={{ paddingBottom: "100px" }}>
      {/* HERO SECTION */}
      <div
        className="reveal-up"
        ref={(el) => { animatedRefs.current[0] = el; }}
        style={{
          padding: "72px 48px",
          marginBottom: "48px",
          textAlign: "center",
          background: "transparent",
          border: "none",
          boxShadow: "none"
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0, 245, 200, 0.12)",
            border: "1px solid rgba(0, 245, 200, 0.3)",
            color: "#00f5c8",
            padding: "6px 18px",
            borderRadius: "20px",
            fontSize: "0.82rem",
            fontWeight: 800,
            marginBottom: "24px"
          }}
          className="font-mono"
        >
          <Zap size={15} /> POWERED BY PARITOK CONTEXT OPTIMIZATION & GROQ LLAMA-3
        </div>

        <h1
          className="font-heading"
          style={{
            fontSize: "4.2rem",
            fontWeight: 900,
            lineHeight: "1.1",
            maxWidth: "980px",
            margin: "0 auto 24px",
            color: "#ffffff",
            letterSpacing: "-0.04em"
          }}
        >
          SUB-SECOND AI THREAT INVESTIGATIONS FROM MILLIONS OF LOGS
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: "760px",
            margin: "0 auto 36px",
            lineHeight: "1.7"
          }}
        >
          Securigation uses <strong style={{ color: "#00f5c8" }}>Paritok's High-Density Compression API</strong> to shrink 15,000+ noisy raw security logs by <strong style={{ color: "#00f5c8" }}>98.7%</strong> before feeding them to Groq AI, delivering sub-second, grounded incident responses with 0% hallucinations.
        </p>


      </div>

      <div
        className="reveal-up"
        ref={(el) => { animatedRefs.current[1] = el; }}
        style={{
          padding: "40px",
          marginBottom: "64px",
          border: "1px solid rgba(0, 245, 200, 0.22)",
          background: "rgba(100, 180, 255, 0.05)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "28px" }}>
          <div>
            <div style={{ fontSize: "0.78rem", color: "#00f5c8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "6px" }} className="font-mono">
              INTERACTIVE DEMO PLAYGROUND
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff" }} className="font-heading">
              TEST COMPRESSION RATIO SIMULATION
            </h2>
          </div>

          {/* Sandbox selector tabs */}
          <div style={{ display: "flex", background: "rgba(5, 7, 12, 0.6)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
            <button
              onClick={() => handleFormatSelect("SSH")}
              style={{
                background: selectedFormat === "SSH" ? "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)" : "transparent",
                color: selectedFormat === "SSH" ? "#040912" : "var(--text-secondary)",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Linux SSH
            </button>
            <button
              onClick={() => handleFormatSelect("APACHE")}
              style={{
                background: selectedFormat === "APACHE" ? "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)" : "transparent",
                color: selectedFormat === "APACHE" ? "#040912" : "var(--text-secondary)",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2"
              }}
            >
              Apache Access
            </button>
            <button
              onClick={() => handleFormatSelect("WINDOWS")}
              style={{
                background: selectedFormat === "WINDOWS" ? "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)" : "transparent",
                color: selectedFormat === "WINDOWS" ? "#040912" : "var(--text-secondary)",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2"
              }}
            >
              Windows EVTX
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", position: "relative" }} className="font-mono">
          {/* Before */}
          <div style={{ padding: "20px", borderLeft: "4px solid #ff3366", background: "rgba(255, 51, 102, 0.05)", backdropFilter: "blur(10px)", borderRadius: "10px", border: "1px solid rgba(255, 51, 102, 0.2)", borderLeft: "4px solid #ff3366" }}>
            <div style={{ color: "#ff3366", fontSize: "0.85rem", fontWeight: 800, marginBottom: "8px" }}>
              ❌ UNCOMPRESSED RAW LOGS ({selectedFormat === "SSH" ? "15,000" : selectedFormat === "APACHE" ? "10,000" : "20,000"} LINES)
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "12px" }}>
              Tokens: {currentSandbox.rawMetrics.tokens.toLocaleString()} | Latency: {currentSandbox.rawMetrics.latency}s | Cost: ${currentSandbox.rawMetrics.cost}
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "6px", fontSize: "0.74rem", color: "var(--text-muted)", height: "150px", overflowY: "auto", border: "1px solid rgba(255,255,255,0.05)" }}>
              {currentSandbox.raw.map((line, i) => (
                <div key={i} style={{ marginBottom: "4px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "2px" }}>{line}</div>
              ))}
              <div style={{ color: "#ff3366", fontSize: "0.7rem", marginTop: "8px" }}>... (Remaining noisy events flood context window)</div>
            </div>
          </div>

          {/* SIMULATOR TRIGGER */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", margin: "10px 0" }}>
            <button
              onClick={runCompressionSimulation}
              disabled={isCompressing}
              style={{
                background: "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)",
                border: "none",
                color: "#040912",
                fontWeight: 700,
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(0, 245, 200, 0.4)",
                transition: "all 0.2s"
              }}
            >
              {isCompressing ? "COMPRESSING CONTEXT..." : "RUN PARITOK OPTIMIZATION"}
            </button>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" }}>
              Click to run Paritok compression engine simulation
            </div>
          </div>

          {/* After */}
          <div style={{ padding: "20px", borderLeft: "4px solid #00f5c8", background: hasCompressed ? "rgba(0, 245, 200, 0.07)" : "rgba(100, 180, 255, 0.04)", backdropFilter: "blur(10px)", borderRadius: "10px", border: hasCompressed ? "1px solid rgba(0, 245, 200, 0.3)" : "1px solid rgba(255,255,255,0.08)", borderLeft: "4px solid #00f5c8", transition: "all 0.5s ease" }}>
            <div style={{ color: "#00f5c8", fontSize: "0.85rem", fontWeight: 800, marginBottom: "8px" }}>
              ⚡ PARITOK OPTIMIZED EVIDENCE (215 LINES) | {currentSandbox.compMetrics.reduction} REDUCTION
            </div>
            <div style={{ fontSize: "0.75rem", color: "#00f5c8", marginBottom: "12px" }}>
              Tokens: {currentSandbox.compMetrics.tokens} | Latency: {currentSandbox.compMetrics.latency}s | Cost: ${currentSandbox.compMetrics.cost}
            </div>

            {isCompressing && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "150px", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", border: "3px solid rgba(0,245,200,0.1)", borderTop: "3px solid #00f5c8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: "0.7rem", color: "#00f5c8", letterSpacing: "0.05em" }} className="font-mono">ANALYZING REDUNDANCIES...</div>
              </div>
            )}

            {!isCompressing && !hasCompressed && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "150px", opacity: 0.3 }}>
                <Terminal size={32} style={{ marginBottom: "10px" }} />
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Optimization Idle</div>
              </div>
            )}

            {!isCompressing && hasCompressed && (
              <div className="fade-in-el" style={{ background: "rgba(0, 245, 200, 0.08)", padding: "12px", borderRadius: "6px", fontSize: "0.74rem", color: "#00f5c8", height: "150px", overflowY: "auto", border: "1px solid rgba(0, 245, 200, 0.15)" }}>
                {currentSandbox.compressed.map((line, i) => (
                  <div key={i} style={{ marginBottom: "8px", lineHeight: 1.45, borderBottom: "1px solid rgba(0,245,200,0.06)", paddingBottom: "4px" }}>{line}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THREE GIANT STAT DISPLAY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "72px"
        }}
      >
        <div
          className="reveal-up"
          ref={(el) => { animatedRefs.current[2] = el; }}
          style={{
            padding: "36px 28px",
            textAlign: "center",
            background: "rgba(100, 180, 255, 0.05)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}
        >
          <div className="stat-number" style={{ color: "#00f5c8" }}>
            98.7%
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "12px" }}>
            • Context payload token reduction in real-time
          </div>
        </div>

        <div
          className="reveal-up"
          ref={(el) => { animatedRefs.current[3] = el; }}
          style={{
            padding: "36px 28px",
            textAlign: "center",
            background: "rgba(100, 180, 255, 0.05)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}
        >
          <div className="stat-number" style={{ color: "#ffffff" }}>
            87,910
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "12px" }}>
            • Redundant tokens saved per inquiry turn
          </div>
        </div>

        <div
          className="reveal-up"
          ref={(el) => { animatedRefs.current[4] = el; }}
          style={{
            padding: "36px 28px",
            textAlign: "center",
            background: "rgba(100, 180, 255, 0.05)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}
        >
          <div className="stat-number" style={{ color: "#00f5c8" }}>
            6.76s
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "12px" }}>
            • Inquiry latency saved vs uncompressed payload
          </div>
        </div>
      </div>

      <div
        className="reveal-up"
        ref={(el) => { animatedRefs.current[5] = el; }}
        style={{
          padding: "48px",
          marginBottom: "72px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(100, 180, 255, 0.05)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontSize: "0.78rem", color: "#00f5c8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "8px" }} className="font-mono">
            WHY TRADITIONAL SIEM AI FAILS
          </div>
          <h2 style={{ fontSize: "2.4rem", fontWeight: 900, color: "#ffffff" }} className="font-heading">
            TRADITIONAL LLM APPROACH VS SECURIGATION
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
          {/* Traditional */}
          <div style={{ padding: "28px", borderLeft: "4px solid #ff3366", background: "rgba(255, 51, 102, 0.06)", backdropFilter: "blur(10px)", borderRadius: "10px", border: "1px solid rgba(255, 51, 102, 0.25)", borderLeft: "4px solid #ff3366" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff3366", fontWeight: 700, marginBottom: "16px" }}>
              <XCircle size={20} />
              <span>TRADITIONAL UNCOMPRESSED SIEM AI</span>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <li style={{ display: "flex", gap: "8px" }}>• <span>15,000+ raw log lines flood context windows</span></li>
              <li style={{ display: "flex", gap: "8px" }}>• <span>8-12 seconds LLM response latency</span></li>
              <li style={{ display: "flex", gap: "8px" }}>• <span>High cost per inquiry query ($0.45 per run)</span></li>
              <li style={{ display: "flex", gap: "8px" }}>• <span>Risk of hallucinated timestamps and IP addresses</span></li>
            </ul>
          </div>

          {/* Securigation */}
          <div style={{ padding: "28px", borderLeft: "4px solid #00f5c8", background: "rgba(0, 245, 200, 0.06)", backdropFilter: "blur(10px)", borderRadius: "10px", border: "1px solid rgba(0, 245, 200, 0.22)", borderLeft: "4px solid #00f5c8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00f5c8", fontWeight: 700, marginBottom: "16px" }}>
              <CheckCircle2 size={20} />
              <span>SECURIGATION + PARITOK ENGINE</span>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem", color: "var(--text-pure)" }}>
              <li style={{ display: "flex", gap: "8px" }}>• <strong style={{ color: "#00f5c8" }}>98.7% token payload reduction before LLM call</strong></li>
              <li style={{ display: "flex", gap: "8px" }}>• <strong style={{ color: "#00f5c8" }}>Sub-second Groq Llama-3 response speed (&lt; 850ms)</strong></li>
              <li style={{ display: "flex", gap: "8px" }}>• <strong style={{ color: "#00f5c8" }}>Near-zero cost per turn ($0.005 per run)</strong></li>
              <li style={{ display: "flex", gap: "8px" }}>• <strong style={{ color: "#00f5c8" }}>100% grounded answers verified against evidence</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* HORIZONTAL STACKED STORY CARDS WITH ALTERNATING SLIDE-IN REVEAL */}
      <div style={{ marginBottom: "72px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "0.78rem", color: "#00f5c8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "8px" }} className="font-mono">
            THE ARCHITECTURE STORY
          </div>
          <h2 style={{ fontSize: "2.6rem", fontWeight: 900, color: "#ffffff" }} className="font-heading">
            HOW SECURIGATION WORKS (STEP-BY-STEP)
          </h2>
        </div>

        {/* Stacked Horizontal Glass Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {storySteps.map((step, idx) => {
            const Icon = step.icon;
            const refIndex = 6 + idx;

            return (
              <div
                key={idx}
                ref={(el) => { animatedRefs.current[refIndex] = el; }}
                className={step.side}
                style={{
                  padding: "40px 48px",
                  display: "grid",
                  gridTemplateColumns: "84px 1fr",
                  gap: "32px",
                  alignItems: "center",
                  background: "rgba(100, 180, 255, 0.05)",
                  backdropFilter: "blur(16px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
                }}
              >
                {/* Step Badge Icon */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      background: `${step.accent}20`,
                      color: step.accent,
                      border: `1px solid ${step.accent}40`,
                      padding: "18px",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 20px ${step.accent}30`
                    }}
                  >
                    <Icon size={34} />
                  </div>
                  <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 800, color: step.accent }}>
                    0{idx + 1}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <div style={{ fontSize: "0.75rem", color: step.accent, fontWeight: 800, letterSpacing: "0.1em", marginBottom: "6px" }} className="font-mono">
                    {step.step} • {step.tag}
                  </div>
                  <h3 style={{ fontSize: "1.55rem", fontWeight: 800, color: "#ffffff", marginBottom: "12px" }} className="font-heading">
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "0.98rem", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="reveal-up"
        ref={(el) => { animatedRefs.current[10] = el; }}
        style={{
          padding: "48px",
          marginBottom: "72px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(100, 180, 255, 0.05)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontSize: "0.78rem", color: "#00f5c8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "8px" }} className="font-mono">
            UNIVERSAL LOG INGESTION
          </div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#ffffff" }} className="font-heading">
            SUPPORTED SECURITY LOG FORMATS
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          <div
            onClick={() => setActiveLogPreview(activeLogPreview === "syslog" ? null : "syslog")}
            style={{
              padding: "20px",
              cursor: "pointer",
              background: activeLogPreview === "syslog" ? "rgba(0, 245, 200, 0.1)" : "rgba(100, 180, 255, 0.04)",
              backdropFilter: "blur(10px)",
              borderRadius: "10px",
              border: activeLogPreview === "syslog" ? "1px solid #00f5c8" : "1px solid rgba(255,255,255,0.08)",
              transition: "all 0.25s ease"
            }}
          >
            <Terminal size={22} color="#00f5c8" style={{ marginBottom: "10px" }} />
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>Linux Syslog (RFC 3164)</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>sshd auth, sudo escalations, scp exfiltration logs.</p>
          </div>

          <div
            onClick={() => setActiveLogPreview(activeLogPreview === "apache" ? null : "apache")}
            style={{
              padding: "20px",
              cursor: "pointer",
              background: activeLogPreview === "apache" ? "rgba(6, 182, 212, 0.1)" : "rgba(100, 180, 255, 0.04)",
              backdropFilter: "blur(10px)",
              borderRadius: "10px",
              border: activeLogPreview === "apache" ? "1px solid #06b6d4" : "1px solid rgba(255,255,255,0.08)",
              transition: "all 0.25s ease"
            }}
          >
            <FileCode size={22} color="#06b6d4" style={{ marginBottom: "10px" }} />
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>Apache Combined</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>WebShell POST uploads, scanner probes, cmd execution.</p>
          </div>

          <div
            onClick={() => setActiveLogPreview(activeLogPreview === "evtx" ? null : "evtx")}
            style={{
              padding: "20px",
              cursor: "pointer",
              background: activeLogPreview === "evtx" ? "rgba(245, 158, 11, 0.1)" : "rgba(100, 180, 255, 0.04)",
              backdropFilter: "blur(10px)",
              borderRadius: "10px",
              border: activeLogPreview === "evtx" ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.08)",
              transition: "all 0.25s ease"
            }}
          >
            <Lock size={22} color="#f59e0b" style={{ marginBottom: "10px" }} />
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>Windows EVTX</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Event ID 4624 remote login, Event ID 4672 LSASS dump.</p>
          </div>

          <div
            onClick={() => setActiveLogPreview(activeLogPreview === "cloudtrail" ? null : "cloudtrail")}
            style={{
              padding: "20px",
              cursor: "pointer",
              background: activeLogPreview === "cloudtrail" ? "rgba(0, 245, 200, 0.1)" : "rgba(100, 180, 255, 0.04)",
              backdropFilter: "blur(10px)",
              borderRadius: "10px",
              border: activeLogPreview === "cloudtrail" ? "1px solid #00f5c8" : "1px solid rgba(255,255,255,0.08)",
              transition: "all 0.25s ease"
            }}
          >
            <Database size={22} color="#00f5c8" style={{ marginBottom: "10px" }} />
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>AWS CloudTrail JSON</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Unauthorized S3 bucket access & IAM policy edits.</p>
          </div>
        </div>

        {/* Console view for selected preview */}
        {activeLogPreview && (
          <div
            className="fade-in-el font-mono"
            style={{
              marginTop: "24px",
              background: "rgba(5, 8, 16, 0.95)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "16px",
              fontSize: "0.78rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "6px" }}>
              <span style={{ color: "#00f5c8", fontWeight: 700 }}>🔍 LIVE RAW LOG PARSER PREVIEW ({activeLogPreview.toUpperCase()})</span>
              <button
                onClick={() => setActiveLogPreview(null)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "0.72rem" }}
              >
                [Dismiss Console]
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#a1a1b4" }}>
              {(activeLogPreview === "syslog" ? [
                "Jul 31 00:01:02 DC-01 sshd[102]: Invalid user guest from 192.168.1.105 port 49152 ssh2",
                "Jul 31 00:01:15 DC-01 sshd[103]: Failed password for invalid user guest from 192.168.1.105 port 49153 ssh2",
                "Jul 31 00:04:12 DC-01 sshd[4122]: Accepted publickey for admin from 192.168.1.105 port 49200 ssh2: RSA SHA256:...",
                "Jul 31 00:05:30 DC-01 sudo:    admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash"
              ] : activeLogPreview === "apache" ? [
                '198.51.100.44 - - [31/Jul/2026:01:10:45 +0000] "POST /upload.php HTTP/1.1" 200 4096',
                '198.51.100.44 - - [31/Jul/2026:01:11:15 +0000] "GET /uploads/shell.php?cmd=whoami HTTP/1.1" 200 128',
                '198.51.100.44 - - [31/Jul/2026:01:11:30 +0000] "GET /uploads/shell.php?cmd=cat%20/etc/passwd HTTP/1.1" 200 2048'
              ] : activeLogPreview === "evtx" ? [
                "<Event><System><EventID>4625</EventID><Computer>DC-01.corp.internal</Computer></System><EventData><Data Name='TargetUserName'>Administrator</Data><Data Name='IpAddress'>10.0.4.15</Data></EventData></Event>",
                "<Event><System><EventID>4624</EventID><Computer>DC-01.corp.internal</Computer></System><EventData><Data Name='TargetUserName'>Administrator</Data><Data Name='LogonType'>10</Data><Data Name='IpAddress'>10.0.4.15</Data></EventData></Event>"
              ] : [
                '{"eventVersion": "1.08", "userIdentity": {"type": "IAMUser", "arn": "arn:aws:iam::123456789:user/attacker"}, "eventName": "PutBucketPolicy", "requestParameters": {"bucketName": "corp-sensitive-backups", "policy": "{\\"Statement\\":...}"}}'
              ]).map((line, i) => (
                <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  <span style={{ color: "rgba(255,255,255,0.2)", marginRight: "8px" }}>{(i + 1).toString().padStart(2, "0")}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className="reveal-up"
        ref={(el) => { animatedRefs.current[11] = el; }}
        style={{
          padding: "64px 48px",
          textAlign: "center"
        }}
      >
        <h2 style={{ fontSize: "2.6rem", fontWeight: 900, color: "#ffffff", marginBottom: "16px" }} className="font-heading">
          READY TO RUN AN INVESTIGATION?
        </h2>
        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: "620px", margin: "0 auto 36px", lineHeight: "1.6" }}>
          Launch the interactive agent workspace to select pre-indexed cyber incident logs or upload raw files.
        </p>

        <button
          className="btn-mint"
          onClick={onLaunchWorkspace}
          style={{ padding: "18px 44px", fontSize: "1.15rem" }}
        >
          <span>LAUNCH SECURIGATION AGENT WORKSPACE</span>
          <ArrowDownRight size={22} />
        </button>
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: "80px",
          paddingTop: "32px",
          borderTop: "1px solid rgba(255, 255, 255, 0.07)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          textAlign: "center"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <span>Built with</span>
          <a
            href="https://github.com/Paritok-official/paritok-4b-v1"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#00f5c8",
              fontWeight: 700,
              textDecoration: "none",
              borderBottom: "1px solid rgba(0, 245, 200, 0.35)",
              paddingBottom: "1px",
              transition: "border-color 0.2s"
            }}
          >
            Paritok
          </a>
          <span>High-Density Context Optimization API</span>
        </div>
        <div style={{ fontSize: "0.78rem", color: "rgba(148, 163, 184, 0.5)" }}>
          &copy; {new Date().getFullYear()} Arpit Tripathi. All rights reserved.
        </div>
      </div>
    </div>
  );
};
