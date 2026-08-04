import React from "react";
import { ArrowUpRight, Upload, FileText, Zap, Cpu, Database, ShieldCheck } from "lucide-react";
import { InvestigationInfo } from "../types";

interface LandingPageProps {
  samples?: InvestigationInfo[];
  onSelectSample?: (sample: InvestigationInfo) => void;
  onSelectDemo?: (demoId: string) => void;
  onUploadFiles?: (files: File[]) => void;
  onUploadCustom?: (files: File[]) => void;
  isLoading?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  samples = [],
  onSelectSample,
  onSelectDemo,
  onUploadFiles,
  onUploadCustom,
  isLoading = false
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = (files: File[]) => {
    if (onUploadFiles) onUploadFiles(files);
    else if (onUploadCustom) onUploadCustom(files);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(Array.from(e.target.files));
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 80px" }}>
      {/* 1. HERO HALFTONE CARD (Matching Inspiration Screenshot) */}
      <div className="hero-matrix-card" style={{ padding: "64px 56px", marginBottom: "64px" }}>
        <h1 className="font-display" style={{ fontSize: "5rem", maxWidth: "900px", color: "#ffffff", marginBottom: "32px", textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>
          INVESTIGATE THREATS THAT SCALE LIKE HUMANS
        </h1>

        <p style={{ fontSize: "1.1rem", color: "rgba(255, 255, 255, 0.75)", maxWidth: "560px", marginBottom: "40px", lineHeight: "1.6" }}>
          Synthetically trained. Symbolically steered. Transform massive security logs into grounded evidence answers using Paritok Context Compression.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <button
            className="btn-mint"
            onClick={() => {
              if (samples.length > 0 && onSelectSample) {
                onSelectSample(samples[0]);
              } else if (onSelectDemo) {
                onSelectDemo("demo-apt29-compromise");
              }
            }}
          >
            <span>TRY AGENT LIVE</span>
            <ArrowUpRight size={16} />
          </button>

          <button
            className="btn-outline-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <span>EXPLORE S. ENGINE</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. THREE GIANT STAT NUMBERS (Matching Inspiration Screenshot) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", marginBottom: "80px", borderBottom: "1px solid var(--border-muted)", paddingBottom: "64px" }}>
        <div>
          <div className="stat-number" style={{ color: "var(--text-pure)" }}>97%</div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "12px" }}>
            • Context payload token reduction in real-time
          </p>
        </div>

        <div>
          <div className="stat-number" style={{ color: "var(--text-pure)" }}>88%</div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "12px" }}>
            • Cost & latency reduction across security queries
          </p>
        </div>

        <div>
          <div className="stat-number" style={{ color: "var(--text-pure)" }}>35x</div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "12px" }}>
            • Faster incident response & threat graph assembly
          </p>
        </div>
      </div>

      {/* 3. FOUR PILLAR CARDS (01, 02, 03, 04) */}
      <div style={{ marginBottom: "80px" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "12px" }}>
          OUR PILLARS
        </div>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "40px" }} className="font-display">
          DESIGNED TO GROW AND ADAPT
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {/* 01: Context Memory */}
          <div className="panel-minimal" style={{ padding: "28px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "32px" }} className="font-mono">(01)</div>
            <div style={{ color: "var(--accent-mint)", marginBottom: "16px" }}><Database size={28} /></div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Context Compression</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>Retain critical security evidence without blowing LLM context windows.</p>
          </div>

          {/* 02: Evidence Pack */}
          <div className="panel-minimal" style={{ padding: "28px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "32px" }} className="font-mono">(02)</div>
            <div style={{ color: "var(--accent-mint)", marginBottom: "16px" }}><ShieldCheck size={28} /></div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Grounded Evidence</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>Every answer links directly to verified log evidence.</p>
          </div>

          {/* 03: Groq LLM */}
          <div className="panel-minimal" style={{ padding: "28px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "32px" }} className="font-mono">(03)</div>
            <div style={{ color: "var(--accent-mint)", marginBottom: "16px" }}><Cpu size={28} /></div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Groq Speed</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>Ultra-fast Llama-3 reasoning executed in sub-500ms latency.</p>
          </div>

          {/* 04: Interactive Graph */}
          <div className="panel-minimal" style={{ padding: "28px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "32px" }} className="font-mono">(04)</div>
            <div style={{ color: "var(--accent-mint)", marginBottom: "16px" }}><Zap size={28} /></div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Dynamic Entity Graph</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>Clickable IP, User, and Host node relationship mapping.</p>
          </div>
        </div>
      </div>

      {/* 4. DATASETS & CUSTOM LOG UPLOAD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "32px" }}>
        {/* Pre-loaded Datasets */}
        <div className="panel-minimal" style={{ padding: "36px" }}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }} className="font-display">
            SELECT INCIDENT SCENARIO
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "24px" }}>
            1-Click pre-indexed security logs for judge evaluation
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {samples.length > 0 ? (
              samples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample && onSelectSample(sample)}
                  className="panel-card-dark"
                  style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-pure)" }}>{sample.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--accent-mint)", marginTop: "4px" }} className="font-mono">
                      {(sample.total_events ?? 0).toLocaleString()} Security Events
                    </div>
                  </div>
                  <ArrowUpRight size={18} color="var(--accent-mint)" />
                </button>
              ))
            ) : (
              <button
                className="btn-mint"
                onClick={() => onSelectDemo && onSelectDemo("demo-apt29-compromise")}
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <span>APT29 SSH Brute Force Scenario</span>
                <ArrowUpRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Upload Custom Logs Zone */}
        <div className="panel-minimal" style={{ padding: "36px" }}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }} className="font-display">
            UPLOAD CUSTOM LOG FILES
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "24px" }}>
            Drag & drop raw EVTX, Syslog, Apache, Firewall, or CloudTrail JSON
          </p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "1px dashed var(--border-strong)",
              borderRadius: "10px",
              padding: "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: "rgba(255, 255, 255, 0.02)",
              transition: "all 0.2s ease"
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <FileText size={36} style={{ color: "var(--accent-mint)", marginBottom: "12px" }} />
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "6px" }}>
              {isLoading ? "Analyzing & Normalizing Logs..." : "Drop logs here or click to browse"}
            </h4>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Parses Syslog RFC 3164, Apache Combined, Windows EVTX, and CloudTrail
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
