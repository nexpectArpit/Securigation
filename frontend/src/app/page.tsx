"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { LandingOverview } from "../components/LandingOverview";
import { PipelineStepper } from "../components/PipelineStepper";
import { ParitokTelemetryDashboard } from "../components/ParitokTelemetryDashboard";
import { InvestigationSummary } from "../components/InvestigationSummary";
import { ChatConsole } from "../components/ChatConsole";
import { CyberMatrixRain } from "../components/CyberMatrixRain";
import { getSampleInvestigations, executeInvestigation, uploadLogFiles, createInvestigation, executeQuery } from "../lib/api_client";
import { InvestigationInfo, QueryResponse, ParitokMetrics } from "../types";
import { ArrowRight, FileText, Upload, Trash2, Plus, AlertCircle, ArrowLeft } from "lucide-react";

// expose getSampleInvestigations on the component scope for the retry button


interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
}

export default function Home() {
  const [activeView, setActiveView] = useState<"OVERVIEW" | "WORKSPACE">("OVERVIEW");
  const [inputMode, setInputMode] = useState<"DEMO" | "UPLOAD">("DEMO");

  const [samples, setSamples] = useState<InvestigationInfo[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>("demo-apt29-compromise");
  const [currentInvestigation, setCurrentInvestigation] = useState<InvestigationInfo | null>(null);

  // Store the active custom investigation if already created in the backend
  const [customInvestigationId, setCustomInvestigationId] = useState<string | null>(null);
  const [customInvestigation, setCustomInvestigation] = useState<InvestigationInfo | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Workspace visibility controls
  const [isWorkspaceVisible, setIsWorkspaceVisible] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [pipelineStep, setPipelineStep] = useState<"IDLE" | "RETRIEVAL" | "EVIDENCE_PACK" | "PARITOK" | "GROQ" | "COMPLETE">("IDLE");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track historical Paritok metrics for trend analysis
  const [historicalMetrics, setHistoricalMetrics] = useState<ParitokMetrics[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const suggestedQueries = [
    "Where did the attack originate, and which user account was compromised?",
    "Show all failed SSH login spikes and root escalation commands",
    "What malicious web requests or commands were executed?"
  ];

  const [samplesError, setSamplesError] = useState<string>("");
  const [samplesLoading, setSamplesLoading] = useState<boolean>(true);

  const [retryCountdown, setRetryCountdown] = useState<number>(5);

  const fetchSamples = () => {
    setSamplesLoading(true);
    getSampleInvestigations()
      .then((data) => {
        setSamples(data);
        setSamplesError("");
        if (data.length > 0) {
          setCurrentInvestigation(data[0]);
          setSelectedSampleId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load sample datasets", err);
        setSamplesError("Render Backend Awakening (Cold Start in Progress)... The free-tier container is booting up. Please wait ~45 seconds.");
        setRetryCountdown(5);
      })
      .finally(() => setSamplesLoading(false));
  };

  // Auto-retry polling loop when backend is awakening from cold start
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (samplesError && !samplesLoading) {
      timer = setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev <= 1) {
            fetchSamples();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [samplesError, samplesLoading]);

  // Fetch sample files on mount
  useEffect(() => {
    fetchSamples();
  }, []);

  // Handle Demo Scenario Selection
  const handleSelectSample = (sample: InvestigationInfo) => {
    setSelectedSampleId(sample.id);
    setCurrentInvestigation(sample);
    setResponse(null);
    setPipelineStep("IDLE");
    setError(null);
    setChatMessages([]);
    setHistoricalMetrics([]); // Reset metrics history for new investigation

    // Smooth transition entry to workspace
    setIsWorkspaceVisible(true);
  };

  // File Upload Handling
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length <= 1) {
      setCustomInvestigationId(null);
      setIsWorkspaceVisible(false);
      setChatMessages([]);
      setResponse(null);
    }
  };

  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Launch workspace with uploaded custom files
  const handleConfirmUploads = async () => {
    if (uploadedFiles.length === 0) return;
    setIsLoading(true);
    setError(null);

    const totalBytes = uploadedFiles.reduce((s, f) => s + f.size, 0);
    const totalMB = (totalBytes / 1024 / 1024).toFixed(1);

    // Estimate upload time at ~1.2 MB/s + 8s backend processing buffer
    let remainingSeconds = Math.max(8, Math.round(totalBytes / (1.2 * 1024 * 1024)) + 8);

    setUploadStatus(`Uploading & processing ${totalMB}MB... ~${remainingSeconds}s remaining`);

    let timerInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds > 0) {
        setUploadStatus(`Uploading & processing ${totalMB}MB... ~${remainingSeconds}s remaining`);
      } else {
        setUploadStatus(`Finalizing parsing and indexing logs... please wait`);
      }
    }, 1000);

    try {
      const inv = await createInvestigation("Custom Upload", `Investigating ${uploadedFiles.length} files`);
      setCustomInvestigationId(inv.id);

      const updatedInv = await uploadLogFiles(inv.id, uploadedFiles);

      if (timerInterval) clearInterval(timerInterval);

      setCustomInvestigation(updatedInv);
      setCurrentInvestigation(updatedInv);
      setUploadedFiles([]); // Clear pending files queue to prevent duplicate uploads

      setUploadStatus("Indexing events into search engine...");
      setIsWorkspaceVisible(true);
      setChatMessages([]);
      setResponse(null);
      setUploadStatus("");
    } catch (err: any) {
      if (timerInterval) clearInterval(timerInterval);
      setError(err.message || "Failed to initialize custom log investigation.");
      setUploadStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle message queries sent via ChatConsole
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Check if API keys are configured in local storage first
    if (typeof window !== "undefined") {
      const pKey = localStorage.getItem("paritok_api_key");
      const gKey = localStorage.getItem("groq_api_key");
      if (!pKey || !gKey) {
        setError("Please add your Paritok and Groq API keys in the Settings page (top right lock icon) first before submitting a query.");
        return;
      }
    }

    // Append user message to thread
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date()
    };
    setChatMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);
    setError(null);
    setPipelineStep("RETRIEVAL");

    try {
      const activeId = inputMode === "UPLOAD" ? customInvestigationId : selectedSampleId;
      if (!activeId) {
        throw new Error("No active investigation session selected.");
      }

      // Execute query
      const result = await executeQuery(activeId, text);

      // Update result state and response card
      setResponse(result);

      // Add new metrics to historical tracking
      if (result.paritok_metrics) {
        setHistoricalMetrics(prev => [...prev, result.paritok_metrics]);
      }

      // Append agent reply to thread
      const agentMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "agent",
        text: result.answer,
        timestamp: new Date()
      };
      setChatMessages((prev) => [...prev, agentMsg]);
      setPipelineStep("COMPLETE");
    } catch (err: any) {
      setError(err.message || "Failed to analyze security query.");
      setPipelineStep("IDLE");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", color: "#ffffff", paddingBottom: "80px" }}>
      {/* Viewport matrix rain */}
      <CyberMatrixRain />

      {/* Navigation bar */}
      <div style={{ position: "relative", zIndex: 30 }}>
        <Navbar activeView={activeView} onToggleView={setActiveView} currentInvestigation={currentInvestigation} />
      </div>

      {activeView === "OVERVIEW" ? (
        <div style={{ position: "relative", zIndex: 10 }}>
          <LandingOverview samples={samples} onLaunchWorkspace={() => setActiveView("WORKSPACE")} onSelectSample={handleSelectSample} />
        </div>
      ) : (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>

          {/* Back to Overview button */}
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-start" }}>
            <button
              onClick={() => setActiveView("OVERVIEW")}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-glass)",
                color: "var(--text-secondary)",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.09)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <ArrowLeft size={14} /> Back to Incident Overview
            </button>
          </div>

          {/* STEP 1: INCIDENT & LOG DATASET SELECTION */}
          <div className="panel-minimal" style={{ padding: "28px", marginBottom: "28px", background: "rgba(10, 16, 28, 0.65)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }} className="font-heading">DATASET INPUT MODE</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Select a preloaded demo incident or upload your own raw security logs
                </p>
              </div>

              {/* Selection Tabs */}
              <div style={{ display: "flex", background: "rgba(5, 7, 12, 0.6)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                <button
                  onClick={() => {
                    setInputMode("DEMO");
                    setIsWorkspaceVisible(false);
                    const sample = samples.find(s => s.id === selectedSampleId);
                    if (sample) setCurrentInvestigation(sample);
                  }}
                  style={{
                    background: inputMode === "DEMO" ? "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)" : "transparent",
                    color: inputMode === "DEMO" ? "#040912" : "var(--text-secondary)",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  Run Demo Scenarios
                </button>

                <button
                  onClick={() => {
                    setInputMode("UPLOAD");
                    setIsWorkspaceVisible(false);
                    setCurrentInvestigation(customInvestigation);
                  }}
                  style={{
                    background: inputMode === "UPLOAD" ? "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)" : "transparent",
                    color: inputMode === "UPLOAD" ? "#040912" : "var(--text-secondary)",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Upload size={16} />
                  <span>Upload Custom Logs</span>
                </button>
              </div>
            </div>

            {/* PRE-LOADED SCENARIO SELECTION */}
            {inputMode === "DEMO" && (
              <div>
                <h4 style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "12px", color: "var(--accent-teal)" }} className="font-mono">
                  SELECT PRE-INDEXED SECURITY LOG INCIDENT:
                </h4>

                {samplesLoading && (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "monospace" }}>
                    ⟳ Loading demo datasets from backend...
                  </div>
                )}

                {samplesError && !samplesLoading && (
                  <div style={{
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "10px",
                    padding: "16px 20px",
                    fontSize: "0.85rem",
                    color: "#fbbf24",
                    fontFamily: "monospace",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 700, fontSize: "0.9rem" }}>
                      <span style={{ animation: "spin 1.5s linear infinite", display: "inline-block" }}>⚡</span>
                      RENDER BACKEND AWAKENING (COLD START)
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                      Render free-tier containers go to sleep after 15 minutes of inactivity. The backend is currently booting up — this takes about 45 seconds.
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                      <div style={{ fontSize: "0.8rem", color: "#6366f1", fontWeight: 600 }}>
                        Auto-checking connection in <span style={{ color: "#00f5c8", fontWeight: 800 }}>{retryCountdown}s</span>...
                      </div>
                      <button
                        onClick={fetchSamples}
                        style={{
                          background: "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)",
                          border: "none",
                          color: "#040912",
                          padding: "6px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 800
                        }}
                      >
                        ↻ Check Connection Now
                      </button>
                    </div>
                  </div>
                )}

                {!samplesLoading && !samplesError && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {samples.map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className="panel-card-dark"
                        style={{
                          padding: "14px 18px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          textAlign: "left",
                          border: selectedSampleId === sample.id && isWorkspaceVisible ? "1px solid #00f5c8" : "1px solid var(--border-glass)",
                          background: selectedSampleId === sample.id && isWorkspaceVisible ? "rgba(0, 245, 200, 0.08)" : "rgba(15, 23, 42, 0.45)",
                          transition: "all 0.2s"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#ffffff" }}>{sample.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{sample.description}</div>
                          <div style={{ fontSize: "0.75rem", color: "#00f5c8", marginTop: "6px" }} className="font-mono">
                            {sample.files?.[0]?.filename || "security_telemetry.log"} • {(sample.total_events ?? 15000).toLocaleString()} Events
                          </div>
                        </div>
                        <ArrowRight size={16} color="#00f5c8" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CUSTOM UPLOAD SCENARIO */}
            {inputMode === "UPLOAD" && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />

                {uploadedFiles.length === 0 ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "1px dashed var(--border-teal)",
                      borderRadius: "8px",
                      padding: "44px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "rgba(0, 245, 200, 0.02)"
                    }}
                  >
                    <Upload size={36} style={{ color: "#00f5c8", marginBottom: "8px" }} />
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px", color: "#ffffff" }}>
                      Drop files here or click to browse
                    </h4>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Supports RFC 3164 Syslog, Apache logs, Windows EVTX XML, and AWS CloudTrail
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Header row — stacked on narrow screens */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }} className="font-mono">
                        FILES PENDING INVESTIGATION ({uploadedFiles.length})
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-glass)",
                            color: "#ffffff",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                          }}
                        >
                          + Add More Files
                        </button>
                        <button
                          onClick={handleConfirmUploads}
                          disabled={isLoading}
                          style={{
                            background: isLoading
                              ? "rgba(0,245,200,0.4)"
                              : "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)",
                            border: "none",
                            color: "#040912",
                            padding: "8px 20px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            cursor: isLoading ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          {isLoading ? "Uploading..." : "⚡ Confirm & Launch Workspace"}
                        </button>
                      </div>
                    </div>

                    {/* Upload progress status */}
                    {uploadStatus && (
                      <div style={{
                        background: "rgba(0,245,200,0.06)",
                        border: "1px solid rgba(0,245,200,0.2)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "0.8rem",
                        color: "#00f5c8",
                        fontFamily: "monospace",
                      }}>
                        <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                        {uploadStatus}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="panel-card-dark"
                          style={{
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "rgba(15, 23, 42, 0.5)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <FileText size={18} color="#00f5c8" />
                            <div>
                              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffffff" }}>{file.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }} className="font-mono">
                                {(file.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(idx)}
                            style={{
                              background: "rgba(255, 51, 102, 0.1)",
                              border: "1px solid rgba(255, 51, 102, 0.3)",
                              color: "#ff3366",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.75rem"
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: ANIMATED WORKSPACE ENTRY (REVEALS ONLY AFTER SELECTION) */}
          {isWorkspaceVisible && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "45% 55%",
              gap: "24px",
              animation: "slideUpWorkspace 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              opacity: 0,
              transform: "translateY(20px)"
            }}>

              {/* Left Pane - Chat Console */}
              <div>
                <ChatConsole
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  suggestedQueries={suggestedQueries}
                />
              </div>

              {/* Right Pane - Telemetry & Analysis */}
              <div style={{ overflowY: "auto", maxHeight: "680px", paddingRight: "6px" }}>

                {/* Pipeline Stepper */}
                {pipelineStep !== "IDLE" && (
                  <PipelineStepper
                    currentStep={pipelineStep}
                    rawCount={response?.paritok_metrics.without_paritok.events || (inputMode === "DEMO" ? (currentInvestigation?.total_events || 15000) : 1000)}
                    compressedCount={response?.paritok_metrics.with_paritok.events || 15}
                    compressionRatio={response?.paritok_metrics.compression_ratio || 99.3}
                  />
                )}

                {/* New Dynamic Paritok Telemetry Dashboard */}
                <ParitokTelemetryDashboard
                  currentMetrics={response?.paritok_metrics}
                  historicalMetrics={historicalMetrics}
                />

                {/* Executive Summary */}
                {response && response.summary && (
                  <InvestigationSummary summary={response.summary} />
                )}

                {/* Error Box */}
                {error && (
                  <div style={{ background: "rgba(255, 51, 102, 0.15)", border: "1px solid rgba(255, 51, 102, 0.4)", borderRadius: "8px", padding: "14px 18px", marginTop: "14px", color: "#ff3366", display: "flex", alignItems: "center", gap: "10px" }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* Workspace slide up keyframes */}
      <style jsx global>{`
        @keyframes slideUpWorkspace {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
