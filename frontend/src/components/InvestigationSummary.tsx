"use client";

import React, { useState } from "react";
import { FileText, ShieldAlert, User, Server, Terminal, LucideIcon } from "lucide-react";
import { InvestigationSummaryData } from "../types";

interface InvestigationSummaryProps {
  summary?: InvestigationSummaryData;
}

const CARD_META: Record<string, {
  label: string;
  icon: LucideIcon;
  color: string;
  tooltip: string;
  placeholder: string;
  mono?: boolean;
}> = {
  initial_access: {
    label: "Initial Vector",
    icon: ShieldAlert,
    color: "#f87171",
    tooltip: "How the attacker first gained access. Could be brute-forced SSH, a phishing link, an exploited CVE, or open RDP. This is the starting point of the kill chain.",
    placeholder: "Analyzing attack vectors...",
  },
  compromised_user: {
    label: "Target Account",
    icon: User,
    color: "#fbbf24",
    tooltip: "The user account compromised or abused during this incident. Could be a service account, admin, or regular user the attacker pivoted through.",
    placeholder: "Identifying compromised accounts...",
    mono: true,
  },
  persistence: {
    label: "Persistence",
    icon: Server,
    color: "#22d3ee",
    tooltip: "How the attacker maintained access after reboot or session end. Common methods include cron jobs, SSH key injection, registry run keys, or a webshell dropped on disk.",
    placeholder: "Detecting persistence mechanisms...",
  },
  outcome: {
    label: "Threat Outcome",
    icon: Terminal,
    color: "#a78bfa",
    tooltip: "What the attacker ultimately achieved. Could be data exfiltration, ransomware deployment, lateral movement to another host, or log tampering to cover tracks.",
    placeholder: "Assessing threat impact...",
    mono: true,
  },
};

const SummaryCard: React.FC<{
  fieldKey: keyof typeof CARD_META;
  value: string | undefined;
}> = ({ fieldKey, value }) => {
  const [hovered, setHovered] = useState(false);
  const meta = CARD_META[fieldKey];
  const Icon = meta.icon;
  const isEmpty = !value || value.toLowerCase() === "unknown" || value.trim() === "";

  const renderFormattedText = (text: string | undefined) => {
    if (!text) return "";
    const parts = text.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} style={{ color: "#00f5c8", fontWeight: 800 }}>{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div
      style={{
        background: hovered ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(255, 255, 255, 0.2)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "12px",
        padding: "16px",
        cursor: "default",
        transition: "all 0.25s ease-in-out",
        minHeight: "115px",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!hovered || isEmpty ? (
        <div
          className="fade-in-el"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
            <Icon size={13} color={meta.color} />
            <span style={{ fontSize: "0.72rem", color: "rgba(170,170,190,0.7)", fontWeight: 500 }}>
              {meta.label}
            </span>
          </div>

          <div style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: isEmpty ? "rgba(150,150,170,0.4)" : "#fff",
            fontFamily: meta.mono ? "monospace" : "inherit",
            fontStyle: isEmpty ? "italic" : "normal",
            lineHeight: 1.45,
            marginTop: "6px",
          }}>
            {isEmpty ? meta.placeholder : renderFormattedText(value)}
          </div>
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
            <div style={{ fontSize: "0.6rem", color: meta.color, fontWeight: 700, letterSpacing: "0.06em", marginBottom: "6px" }}>
              WHAT THIS MEANS
            </div>
            <div style={{
              fontSize: "0.72rem",
              color: "rgba(210,210,230,0.9)",
              lineHeight: 1.45,
            }}>
              {meta.tooltip}
            </div>
          </div>
          <div style={{
            fontSize: "0.72rem",
            color: "rgba(160,160,180,0.7)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "6px",
            fontFamily: "monospace",
            marginTop: "10px",
          }}>
            {renderFormattedText(value)}
          </div>
        </div>
      )}
    </div>
  );
};

export const InvestigationSummary: React.FC<InvestigationSummaryProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div style={{
      background: "rgba(8,13,24,0.75)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{ color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "6px", borderRadius: "8px" }}>
          <FileText size={16} />
        </div>
        <div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
            EXECUTIVE INCIDENT SUMMARY
          </span>
          <div style={{ fontSize: "0.66rem", color: "rgba(150,150,170,0.5)", marginTop: "2px" }}>
            Hover any card to understand what it means
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <SummaryCard fieldKey="initial_access"    value={summary.initial_access} />
        <SummaryCard fieldKey="compromised_user"  value={summary.compromised_user} />
        <SummaryCard fieldKey="persistence"       value={summary.persistence} />
        <SummaryCard fieldKey="outcome"           value={summary.outcome} />
      </div>
    </div>
  );
};
