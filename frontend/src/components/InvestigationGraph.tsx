import React from "react";
import { GitFork, Server, User, Globe, FileCode, ArrowRight } from "lucide-react";
import { GraphData, GraphNode, GraphEdge } from "../types";

interface InvestigationGraphProps {
  graph: GraphData;
  selectedEntity: string | null;
  onSelectEntity: (entityId: string | null) => void;
}

export const InvestigationGraph: React.FC<InvestigationGraphProps> = ({
  graph,
  selectedEntity,
  onSelectEntity
}) => {
  if (!graph || !graph.nodes || graph.nodes.length === 0) return null;

  const getNodeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "IP":
      case "EXTERNAL_IP":
        return Globe;
      case "USER":
      case "ACCOUNT":
        return User;
      case "HOST":
      case "SERVER":
        return Server;
      default:
        return FileCode;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "IP": return "#00f5c8";
      case "USER": return "#f59e0b";
      case "HOST": return "#06b6d4";
      case "C2": return "#ff3366";
      default: return "#a855f7";
    }
  };

  return (
    <div className="panel-minimal" style={{ padding: "28px", marginTop: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ color: "#00f5c8", background: "rgba(0, 245, 200, 0.15)", padding: "8px", borderRadius: "8px" }}>
            <GitFork size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff" }} className="font-heading">
              INTERACTIVE INVESTIGATION GRAPH
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Click any node to filter events across the timeline and evidence panel
            </p>
          </div>
        </div>

        {selectedEntity && (
          <button
            onClick={() => onSelectEntity(null)}
            style={{
              background: "rgba(255, 51, 102, 0.15)",
              border: "1px solid rgba(255, 51, 102, 0.4)",
              color: "#ff3366",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Clear Filter: {selectedEntity}
          </button>
        )}
      </div>

      {/* Node Flow Container */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", padding: "20px", background: "rgba(5, 7, 12, 0.85)", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
        {graph.nodes.map((node: GraphNode, idx: number) => {
          const Icon = getNodeIcon(node.type);
          const accentColor = getNodeColor(node.type);
          const isSelected = selectedEntity === node.id || selectedEntity === node.label;
          const edge = graph.edges[idx - 1];

          return (
            <React.Fragment key={node.id}>
              {idx > 0 && (
                <div style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", fontSize: "0.78rem", gap: "4px" }} className="font-mono">
                  <span>{edge?.relationship || "connected"}</span>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              )}

              <div
                onClick={() => onSelectEntity(isSelected ? null : node.label)}
                className="panel-card-dark"
                style={{
                  padding: "14px 20px",
                  border: isSelected ? `2px solid ${accentColor}` : "1px solid var(--border-glass)",
                  boxShadow: isSelected ? `0 0 20px ${accentColor}50` : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: isSelected ? `${accentColor}20` : "rgba(10, 16, 28, 0.95)"
                }}
              >
                <div style={{ color: accentColor, background: `${accentColor}25`, padding: "8px", borderRadius: "8px" }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    {node.type}
                  </div>
                  <div className="font-mono" style={{ fontSize: "0.92rem", fontWeight: 800, color: "#ffffff" }}>
                    {node.label}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
