// src/app/editor/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Document } from "@/types";
import TipTapEditor from "@/components/Editor/TipTapEditor";
import AIToolbar from "@/components/Editor/AIToolbar";
import { useAutosave } from "@/hooks/useAutosave";
import { useDarkMode } from "@/hooks/useDarkMode";

// ── Particles ─────────────────────────────────────────────────────────────────
function ParticlesBackground({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 60;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.35)";
        ctx.fill();
      }

      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / 120) * (isDark ? 0.15 : 0.1);
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EditorPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorInstance, setEditorInstance] = useState<{
    getHTML: () => string;
    setContent: (html: string) => void;
  } | null>(null);
  const { isDark, toggle } = useDarkMode();

  useAutosave(id, content);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) fetchDocument();
  }, [user]);

  const fetchDocument = async () => {
    try {
      const { data } = await api.get<Document>(`/api/documents/${id}`);
      setDocument(data);
      setContent(data.content);
      setTitle(data.title);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const saveTitle = async () => {
    if (!title.trim() || title === document?.title) {
      setEditingTitle(false);
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/documents/${id}/title`, { title });
      setDocument((prev) => (prev ? { ...prev, title } : null));
    } finally {
      setSaving(false);
      setEditingTitle(false);
    }
  };

  const handleAIResult = (result: string) => {
    const htmlResult = result
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => `<p>${line}</p>`)
      .join("");
    const newContent = content + htmlResult;
    setContent(newContent);
    editorInstance?.setContent(newContent);
  };

  // Colors
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const textMuted = isDark ? "#475569" : "#94a3b8";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.75)";
  const headerBg = isDark ? "rgba(6,13,26,0.85)" : "rgba(255,255,255,0.75)";
  const editorBg = isDark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.92)";

  if (isLoading || loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: isDark
          ? "linear-gradient(135deg, #060d1a 0%, #0f172a 50%, #0c1631 100%)"
          : "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color: textMuted, fontSize: "14px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: isDark
        ? "linear-gradient(135deg, #060d1a 0%, #0f172a 50%, #0c1631 100%)"
        : "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%)",
      position: "relative",
    }}>
      <ParticlesBackground isDark={isDark} />

      {/* Header */}
      <header style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        backgroundColor: headerBg,
        borderBottom: `1px solid ${border}`,
        position: "sticky", top: 0, zIndex: 10,
      }} className="px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          {/* Left: back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                color: textSecondary,
                background: cardBg,
                border: `1px solid ${border}`,
                backdropFilter: "blur(8px)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = border}
            >
              ← Back
            </button>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "26px", height: "26px", borderRadius: "6px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", flexShrink: 0,
              }}>✍️</div>
              <span style={{ fontWeight: 700, fontSize: "15px", color: isDark ? "#f1f5f9" : "#1e1b4b" }}>
                WriteAI
              </span>
            </div>

            {/* Title */}
            <div style={{ width: "1px", height: "18px", backgroundColor: border }} />
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                style={{
                  color: textPrimary,
                  borderBottom: "1px solid #6366f1",
                  fontSize: "14px", fontWeight: 500,
                  outline: "none", background: "transparent",
                  minWidth: "120px",
                }}
              />
            ) : (
              <h1
                onClick={() => setEditingTitle(true)}
                title="Click to rename"
                style={{
                  color: textPrimary, fontSize: "14px", fontWeight: 500,
                  cursor: "pointer", transition: "color 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#818cf8"}
                onMouseLeave={(e) => e.currentTarget.style.color = textPrimary}
              >
                {title}
              </h1>
            )}
          </div>

          {/* Right: saved + dark mode */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{
              color: saving ? "#818cf8" : textMuted,
              fontSize: "12px",
              transition: "color 0.2s",
            }}>
              {saving ? "💾 Saving..." : "✓ Saved"}
            </span>
            <button
              onClick={toggle}
              style={{
                color: textSecondary,
                border: `1px solid ${border}`,
                backgroundColor: cardBg,
                backdropFilter: "blur(8px)",
                cursor: "pointer",
              }}
              className="text-sm px-3 py-1.5 rounded-lg transition"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </header>

      {/* Editor + Sidebar */}
      <main
        className="max-w-6xl mx-auto px-6 py-8 flex gap-6"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Editor card */}
        <div className="flex-1">
          <div style={{
            backgroundColor: editorBg,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${border}`,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.3)"
              : "0 8px 32px rgba(99,102,241,0.08)",
          }}>
            <TipTapEditor
              content={content}
              onChange={setContent}
              onEditorReady={setEditorInstance}
              isDark={isDark}
            />
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="w-64 shrink-0">
          <AIToolbar
            getContent={() => editorInstance?.getHTML() ?? content}
            onResult={handleAIResult}
            isDark={isDark}
          />
        </div>
      </main>
    </div>
  );
}