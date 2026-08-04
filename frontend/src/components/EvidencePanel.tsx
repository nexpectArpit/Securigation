import React, { useState } from "react";
import { Database, Search } from "lucide-react";
import { UnifiedSecurityEvent } from "../types";

interface EvidencePanelProps {
  events: UnifiedSecurityEvent[];
  selectedEntity: string | null;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ events, selectedEntity }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      !searchTerm ||
      e.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.source_ip && e.source_ip.includes(searchTerm)) ||
      (e.user_account && e.user_account.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEntity =
      !selectedEntity ||
      e.summary.toLowerCase().includes(selectedEntity.toLowerCase()) ||
      (e.source_ip && e.source_ip.includes(selectedEntity)) ||
      (e.user_account && e.user_account.toLowerCase().includes(selectedEntity.toLowerCase()));

    return matchesSearch && matchesEntity;
  });

  const getSevBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case "CRITICAL": return { color: "#ff3366", bg: "rgba(255, 51, 102, 0.15)" };
      case "HIGH": return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
      default: return { color: "#00f5c8", bg: "rgba(0, 245, 200, 0.15)" };
    }
  };

  return (
    <div className="panel-minimal" style={{ padding: "28px", marginTop: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ color: "#00f5c8", background: "rgba(0, 245, 200, 0.15)", padding: "8px", borderRadius: "8px" }}>
            <Database size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff" }} className="font-heading">
              SUPPORTING EVIDENCE & NORMALIZED EVENTS
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Showing {filteredEvents.length} of {events.length} Paritok-retained evidence records
            </p>
          </div>
        </div>

        {/* Filter Input */}
        <div style={{ position: "relative", minWidth: "280px" }}>
          <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search IP, User, Command..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(5, 7, 12, 0.65)",
              border: "1px solid var(--border-glass)",
              color: "#ffffff",
              padding: "10px 14px 10px 38px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Events Table Container */}
      <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid var(--border-glass)", background: "rgba(5, 7, 12, 0.45)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(12, 20, 35, 0.75)", borderBottom: "1px solid var(--border-glass)", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "12px 14px" }}>Timestamp</th>
              <th style={{ padding: "12px 14px" }}>Log Source</th>
              <th style={{ padding: "12px 14px" }}>Severity</th>
              <th style={{ padding: "12px 14px" }}>Source IP</th>
              <th style={{ padding: "12px 14px" }}>Account</th>
              <th style={{ padding: "12px 14px" }}>Summary</th>
            </tr>
          </thead>
          <tbody className="font-mono" style={{ fontSize: "0.82rem" }}>
            {filteredEvents.map((evt, idx) => {
              const badge = getSevBadge(evt.severity);

              return (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? "rgba(10, 16, 28, 0.55)" : "rgba(15, 23, 40, 0.55)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    transition: "background 0.15s ease"
                  }}
                >
                  <td style={{ padding: "14px", color: "#00f5c8", whiteSpace: "nowrap", fontWeight: 600 }}>
                    {evt.timestamp}
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {evt.log_source}
                  </td>
                  <td style={{ padding: "14px", whiteSpace: "nowrap" }}>
                    <span style={{ background: badge.bg, color: badge.color, padding: "3px 10px", borderRadius: "12px", fontWeight: 700, fontSize: "0.72rem" }}>
                      {evt.severity}
                    </span>
                  </td>
                  <td style={{ padding: "14px", color: "#ffffff", fontWeight: 700 }}>
                    {evt.source_ip || "-"}
                  </td>
                  <td style={{ padding: "14px", color: "#f59e0b", fontWeight: 700 }}>
                    {evt.user_account || "-"}
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    {evt.summary}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
