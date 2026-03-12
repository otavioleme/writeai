// src/components/Editor/AIToolbar.tsx
"use client";

import { useState } from "react";
import { useAI } from "@/hooks/useAI";

interface AIToolbarProps {
  getContent: () => string;
  onResult: (result: string) => void;
  isDark?: boolean;
}

export default function AIToolbar({ getContent, onResult, isDark }: AIToolbarProps) {
  const { run, loading } = useAI();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleAction = async (action: "improve" | "summarize" | "ideas") => {
    const content = getContent();
    if (!content || content === "<p></p>") {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    setActiveAction(action);
    const result = await run(action, content);
    onResult(result);
    setActiveAction(null);
  };

  const actions = [
    { id: "improve", label: "✨ Improve Writing", description: "Make it clearer and more professional" },
    { id: "summarize", label: "📝 Summarize", description: "Get a concise summary" },
    { id: "ideas", label: "💡 Generate Ideas", description: "Expand with new ideas" },
  ] as const;

  const card = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#1f2937";
  const textMuted = isDark ? "#64748b" : "#9ca3af";
  const activeBorder = isDark ? "#3b82f6" : "#93c5fd";
  const activeBg = isDark ? "#1e3a5f" : "#eff6ff";

  return (
    <>
      <div style={{ backgroundColor: card, border: `1px solid ${border}` }} className="rounded-xl p-4">
        <p style={{ color: textMuted }} className="text-xs font-semibold uppercase tracking-wide mb-3">
          AI Actions
        </p>
        <div className="flex flex-col gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              disabled={loading}
              style={{
                backgroundColor: activeAction === action.id ? activeBg : "transparent",
                borderColor: activeAction === action.id ? activeBorder : border,
              }}
              className="flex items-start gap-3 p-3 rounded-lg text-left transition border disabled:opacity-50"
            >
              <div>
                <p style={{ color: textPrimary }} className="text-sm font-medium">{action.label}</p>
                <p style={{ color: textMuted }} className="text-xs mt-0.5">{action.description}</p>
              </div>
              {activeAction === action.id && (
                <span className="ml-auto text-xs text-blue-500 animate-pulse">Thinking...</span>
              )}
            </button>
          ))}
        </div>
      </div>

{/* Toast */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: showToast ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-12px)",
          backgroundColor: isDark ? "#1e293b" : "#1f2937",
          color: "#f1f5f9",
          padding: "12px 16px",
          borderRadius: "10px",
          fontSize: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "opacity 0.3s, transform 0.3s",
          opacity: showToast ? 1 : 0,
          pointerEvents: "none",
        }}
      >
        ✏️ Write something first!
      </div>
    </>
  );
}