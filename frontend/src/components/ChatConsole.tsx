import React, { useState, useRef, useEffect } from "react";
import { Send, Terminal, Bot, User } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
}

interface ChatConsoleProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  suggestedQueries: string[];
}

export const ChatConsole: React.FC<ChatConsoleProps> = ({
  messages,
  onSendMessage,
  isLoading,
  suggestedQueries
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  return (
    <div
      className="panel-minimal"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "680px",
        padding: "24px",
        background: "rgba(10, 16, 28, 0.45)",
        border: "1px solid var(--border-cyan)",
        borderRadius: "12px",
        position: "relative"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px", marginBottom: "16px" }}>
        <div style={{ background: "rgba(0, 245, 200, 0.12)", padding: "8px", borderRadius: "8px", color: "#00f5c8" }}>
          <Terminal size={18} />
        </div>
        <div>
          <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#ffffff" }} className="font-heading">
            INVESTIGATION CHAT CONSOLE
          </h4>
          <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }} className="font-mono">
            Active Session • Grounded Groundtruth Mode
          </p>
        </div>
      </div>

      {/* Message List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          paddingRight: "6px",
          marginBottom: "16px"
        }}
      >
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 20px" }}>
            <div style={{ color: "var(--text-muted)", marginBottom: "18px" }}>
              <Bot size={44} style={{ opacity: 0.6, strokeWidth: 1.5 }} />
            </div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Securigation Threat Analyst Online
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "24px", maxWidth: "320px" }}>
              Ask questions about anomalous user accounts, remote network origins, lateral movement vectors, or exfiltration indicators.
            </div>

            {/* Suggested Prompts */}
            {suggestedQueries.length > 0 && (
              <div style={{ width: "100%", maxWidth: "380px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {suggestedQueries.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(query)}
                    style={{
                      background: "rgba(5, 7, 12, 0.5)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#00f5c8",
                      fontSize: "0.78rem",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#00f5c8";
                      e.currentTarget.style.background = "rgba(0, 245, 200, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-glass)";
                      e.currentTarget.style.background = "rgba(5, 7, 12, 0.5)";
                    }}
                  >
                    "{query}"
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isUser ? "flex-end" : "flex-start",
                  width: "100%"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", fontSize: "0.72rem", color: "var(--text-muted)" }} className="font-mono">
                  {isUser ? (
                    <>
                      <span>You</span>
                      <User size={12} />
                    </>
                  ) : (
                    <>
                      <Bot size={12} color="#00f5c8" />
                      <span style={{ color: "#00f5c8" }}>Securigation AI</span>
                    </>
                  )}
                </div>

                <div
                  style={{
                    background: isUser ? "rgba(6, 182, 212, 0.15)" : "rgba(5, 7, 12, 0.8)",
                    border: isUser ? "1px solid rgba(6, 182, 212, 0.4)" : "1px solid var(--border-glass)",
                    borderRadius: "12px",
                    borderTopRightRadius: isUser ? "2px" : "12px",
                    borderTopLeftRadius: isUser ? "12px" : "2px",
                    padding: "12px 16px",
                    fontSize: "0.85rem",
                    color: "#ffffff",
                    maxWidth: "85%",
                    lineHeight: "1.5",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    wordBreak: "break-word"
                  }}
                >
                  {(() => {
                    const parts = msg.text.split("**");
                    return parts.map((part, i) => {
                      if (i % 2 === 1) {
                        return <strong key={i} style={{ color: "#00f5c8", fontWeight: 800 }}>{part}</strong>;
                      }
                      return part;
                    });
                  })()}
                </div>
              </div>
            );
          })
        )}

        {/* Typing Loading Indicator */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", fontSize: "0.72rem", color: "#00f5c8" }} className="font-mono">
              <Bot size={12} color="#00f5c8" />
              <span>Securigation AI is thinking...</span>
            </div>
            <div
              style={{
                background: "rgba(5, 7, 12, 0.8)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                borderTopLeftRadius: "2px",
                padding: "14px 18px",
                display: "flex",
                gap: "4px",
                alignItems: "center"
              }}
            >
              <span className="dot-pulse" style={{ width: "6px", height: "6px", background: "#00f5c8", borderRadius: "50%", animation: "pulseDot 1.4s infinite ease-in-out both" }} />
              <span className="dot-pulse" style={{ width: "6px", height: "6px", background: "#00f5c8", borderRadius: "50%", animation: "pulseDot 1.4s infinite ease-in-out both", animationDelay: "0.2s" }} />
              <span className="dot-pulse" style={{ width: "6px", height: "6px", background: "#00f5c8", borderRadius: "50%", animation: "pulseDot 1.4s infinite ease-in-out both", animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about credentials, hosts, exfiltration commands..."
          disabled={isLoading}
          style={{
            flex: 1,
            background: "rgba(5, 7, 12, 0.85)",
            border: "1px solid var(--border-glass)",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "#ffffff",
            fontSize: "0.85rem",
            outline: "none",
            transition: "all 0.2s"
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--cyan-glow)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-glass)")}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          style={{
            background: "linear-gradient(135deg, #00f5c8 0%, #06b6d4 100%)",
            border: "none",
            borderRadius: "8px",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#040912",
            cursor: "pointer",
            transition: "opacity 0.2s",
            opacity: isLoading || !inputValue.trim() ? 0.5 : 1
          }}
        >
          <Send size={18} />
        </button>
      </form>

      {/* Keyframe Styles */}
      <style jsx>{`
        @keyframes pulseDot {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
