import React from "react";
import { Clock } from "lucide-react";
import { TimelineEvent } from "../types";

interface AttackTimelineProps {
  timeline: TimelineEvent[];
  selectedEntity: string | null;
}

export const AttackTimeline: React.FC<AttackTimelineProps> = ({ timeline, selectedEntity }) => {
  if (!timeline || timeline.length === 0) return null;

  const filteredTimeline = selectedEntity
    ? timeline.filter((evt) =>
        evt.description.toLowerCase().includes(selectedEntity.toLowerCase()) ||
        evt.title.toLowerCase().includes(selectedEntity.toLowerCase())
      )
    : timeline;

  const getSeverityBadge = (severity?: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL": return { bg: "rgba(255, 51, 102, 0.15)", border: "rgba(255, 51, 102, 0.4)", color: "#ff3366" };
      case "HIGH": return { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", color: "#f59e0b" };
      default: return { bg: "rgba(0, 245, 200, 0.15)", border: "rgba(0, 245, 200, 0.4)", color: "#00f5c8" };
    }
  };

  return (
    <div className="panel-minimal" style={{ padding: "28px", marginTop: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.15)", padding: "8px", borderRadius: "8px" }}>
          <Clock size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff" }} className="font-heading">
            ATTACK TIMELINE & MILESTONES
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Chronological progression of key security events
          </p>
        </div>
      </div>

      <div style={{ position: "relative", paddingLeft: "24px" }}>
        {/* Timeline Vertical Bar */}
        <div style={{ position: "absolute", left: "9px", top: "10px", bottom: "10px", width: "2px", background: "linear-gradient(to bottom, #ff3366, #f59e0b, #00f5c8)" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredTimeline.map((item, idx) => {
            const sev = getSeverityBadge(item.severity);

            return (
              <div key={idx} style={{ position: "relative" }}>
                {/* Timeline Dot */}
                <div
                  style={{
                    position: "absolute",
                    left: "-20px",
                    top: "16px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: sev.color,
                    boxShadow: `0 0 12px ${sev.color}`
                  }}
                />

                <div className="panel-card-dark" style={{ padding: "18px", background: "rgba(10, 16, 28, 0.95)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="font-mono" style={{ fontSize: "0.82rem", color: "#00f5c8", fontWeight: 700 }}>
                        {item.timestamp}
                      </span>
                      <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#ffffff" }}>
                        {item.title}
                      </span>
                    </div>

                    {item.severity && (
                      <span
                        className="font-mono"
                        style={{
                          background: sev.bg,
                          border: `1px solid ${sev.border}`,
                          color: sev.color,
                          padding: "2px 10px",
                          borderRadius: "12px",
                          fontSize: "0.72rem",
                          fontWeight: 700
                        }}
                      >
                        {item.severity}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
