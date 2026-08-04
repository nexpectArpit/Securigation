"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Key, Shield, ArrowLeft, Check, Sparkles, ExternalLink, Trash2, Eye, EyeOff } from "lucide-react";
import { CyberMatrixRain } from "../../components/CyberMatrixRain";

export default function SettingsPage() {
  const [paritokKey, setParitokKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [showParitok, setShowParitok] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVED">("IDLE");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setParitokKey(localStorage.getItem("paritok_api_key") || "");
      setGroqKey(localStorage.getItem("groq_api_key") || "");
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      if (paritokKey.trim()) {
        localStorage.setItem("paritok_api_key", paritokKey.trim());
      } else {
        localStorage.removeItem("paritok_api_key");
      }

      if (groqKey.trim()) {
        localStorage.setItem("groq_api_key", groqKey.trim());
      } else {
        localStorage.removeItem("groq_api_key");
      }
    }
    setSaveStatus("SAVED");
    setTimeout(() => setSaveStatus("IDLE"), 2500);
  };

  const handleClearAll = () => {
    setParitokKey("");
    setGroqKey("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("paritok_api_key");
      localStorage.removeItem("groq_api_key");
    }
    setSaveStatus("SAVED");
    setTimeout(() => setSaveStatus("IDLE"), 2500);
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", color: "#ffffff", padding: "40px 24px" }}>
      {/* Background Matrix Rain */}
      <CyberMatrixRain />

      <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        {/* Navigation back */}
        <div style={{ marginBottom: "28px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#cbd5e1",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Settings Panel */}
        <div className="panel-minimal" style={{ padding: "32px", background: "rgba(8, 13, 24, 0.85)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>
            <div style={{ background: "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)", padding: "10px", borderRadius: "10px", color: "#040912", display: "flex" }}>
              <Key size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.02em" }} className="font-heading">
                BYOK API KEY CONFIGURATION
              </h2>
              <p style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "2px" }}>
                Bring Your Own Keys. Stored locally in your browser storage.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Paritok Key Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", letterSpacing: "0.03em" }}>
                  PARITOK API KEY
                </label>
                {/* Only show website link if key is empty */}
                {!paritokKey.trim() && (
                  <a
                    href="https://www.paritok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.72rem",
                      color: "#00f5c8",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    Get Paritok Key <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showParitok ? "text" : "password"}
                  placeholder="paritok_key_..."
                  value={paritokKey}
                  onChange={(e) => setParitokKey(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    padding: "12px 42px 12px 14px",
                    fontSize: "0.85rem",
                    color: "#fff",
                    fontFamily: "monospace",
                    outline: "none"
                  }}
                />
                {paritokKey.trim() && (
                  <button
                    type="button"
                    onClick={() => setShowParitok(!showParitok)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.45)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    {showParitok ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>

            {/* Groq Key Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", letterSpacing: "0.03em" }}>
                  GROQ LLM API KEY
                </label>
                {/* Only show website link if key is empty */}
                {!groqKey.trim() && (
                  <a
                    href="https://console.groq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.72rem",
                      color: "#06b6d4",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    Get Groq Key <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showGroq ? "text" : "password"}
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    padding: "12px 42px 12px 14px",
                    fontSize: "0.85rem",
                    color: "#fff",
                    fontFamily: "monospace",
                    outline: "none"
                  }}
                />
                {groqKey.trim() && (
                  <button
                    type="button"
                    onClick={() => setShowGroq(!showGroq)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.45)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    {showGroq ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
              <button
                onClick={handleClearAll}
                style={{
                  background: "rgba(255, 51, 102, 0.08)",
                  border: "1px solid rgba(255, 51, 102, 0.25)",
                  color: "#ff3366",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s"
                }}
              >
                <Trash2 size={14} /> Clear Keys
              </button>

              <button
                onClick={handleSave}
                style={{
                  background: "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "#040912",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 0 16px rgba(0, 245, 200, 0.35)",
                  transition: "all 0.2s"
                }}
              >
                {saveStatus === "SAVED" ? (
                  <>
                    <Check size={14} /> Saved!
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Save Configuration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
