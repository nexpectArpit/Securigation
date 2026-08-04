import React, { useState, useEffect } from "react";
import { Shield, Key } from "lucide-react";
import Link from "next/link";
import { InvestigationInfo } from "../types";

interface NavbarProps {
  currentInvestigation?: InvestigationInfo | null;
  activeView: "OVERVIEW" | "WORKSPACE";
  onToggleView: (view: "OVERVIEW" | "WORKSPACE") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentInvestigation,
  activeView,
  onToggleView
}) => {
  const [hasCustomKeys, setHasCustomKeys] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pKey = localStorage.getItem("paritok_api_key");
      const gKey = localStorage.getItem("groq_api_key");
      setHasCustomKeys(!!(pKey || gKey));
    }
  }, []);



  return (
    <header
      style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.16)",
        padding: "16px 32px",
        background: "rgba(14, 23, 42, 0.55)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        marginBottom: "32px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 -1px 0 0 rgba(255, 255, 255, 0.12)"
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            onClick={() => onToggleView("OVERVIEW")}
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)",
                padding: "8px",
                borderRadius: "8px",
                color: "#040912",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(0, 245, 200, 0.4)"
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                SECURIGATION
              </div>
              <div style={{ fontSize: "0.72rem", color: "#00f5c8", fontWeight: 600 }} className="font-mono">
                BUILD WITH PARITOK
              </div>
            </div>
          </div>
        </div>

        {/* Right Action */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {currentInvestigation && activeView === "WORKSPACE" && (
            <div
              className="font-mono"
              style={{
                fontSize: "0.78rem",
                color: "#00f5c8",
                background: "rgba(0, 245, 200, 0.10)",
                border: "1px solid rgba(0, 245, 200, 0.3)",
                padding: "6px 14px",
                borderRadius: "20px"
              }}
            >
              {currentInvestigation.title} ({(currentInvestigation.total_events ?? 15000).toLocaleString()} Events)
            </div>
          )}

          {activeView === "OVERVIEW" ? (
            <button
              className="btn-mint"
              onClick={() => onToggleView("WORKSPACE")}
              style={{ padding: "8px 18px", fontSize: "0.82rem" }}
            >
              <span>Workspace Mode</span>
            </button>
          ) : null}

          {/* BYOK Settings Link */}
          <Link href="/settings" style={{ textDecoration: "none" }}>
            <button
              style={{
                background: hasCustomKeys ? "rgba(0, 245, 200, 0.1)" : "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${hasCustomKeys ? "rgba(0, 245, 200, 0.4)" : "rgba(255, 255, 255, 0.15)"}`,
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: hasCustomKeys ? "#00f5c8" : "rgba(255, 255, 255, 0.8)",
                transition: "all 0.2s ease"
              }}
              title="API Keys Settings"
            >
              <Key size={16} />
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};
