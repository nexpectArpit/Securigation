import React from "react";
import { CheckCircle, ShieldCheck } from "lucide-react";

interface EvidenceUsedBoxProps {
  evidenceUsed: string[];
}

export const EvidenceUsedBox: React.FC<EvidenceUsedBoxProps> = ({ evidenceUsed }) => {
  if (!evidenceUsed || evidenceUsed.length === 0) return null;

  return (
    <div className="panel-minimal" style={{ padding: "24px", marginBottom: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{ color: "#00f5c8", background: "rgba(0, 245, 200, 0.12)", padding: "6px", borderRadius: "6px" }}>
          <ShieldCheck size={18} />
        </div>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#00f5c8" }} className="font-heading">
          EVIDENCE USED IN THIS ANSWER (VERIFIED GROUNDING)
        </h4>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {evidenceUsed.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(0, 245, 200, 0.08)",
              border: "1px solid rgba(0, 245, 200, 0.2)",
              color: "#ffffff"
            }}
          >
            <CheckCircle size={14} color="#00f5c8" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
