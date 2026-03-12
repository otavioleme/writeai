// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Document } from "@/types";
import { useDarkMode } from "@/hooks/useDarkMode";
import ConfirmModal from "@/components/UI/ConfirmModal";

// ── Particles canvas ──────────────────────────────────────────────────────────
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
      const color = isDark ? "99,102,241" : "99,102,241";

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(${color},0.5)` : `rgba(${color},0.35)`;
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
      style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      }}
    />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { isDark, toggle } = useDarkMode();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  useEffect(() => {
    if (!loading) setTimeout(() => setMounted(true), 50);
  }, [loading]);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get<Document[]>("/api/documents");
      setDocuments(data);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async () => {
    setCreating(true);
    try {
      const { data } = await api.post<Document>("/api/documents", { title: "Untitled" });
      router.push(`/editor/${data.id}`);
    } finally {
      setCreating(false);
    }
  };

  const deleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    await api.delete(`/api/documents/${confirmId}`);
    setDocuments((prev) => prev.filter((d) => d.id !== confirmId));
    setConfirmId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const bg = isDark ? "#060d1a" : "#f0f4ff";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const textMuted = isDark ? "#475569" : "#94a3b8";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)";
  const headerBg = isDark ? "rgba(6,13,26,0.8)" : "rgba(255,255,255,0.7)";
  const modalBg = isDark ? "#1e293b" : "#ffffff";

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
      overflow: "hidden",
    }}>

      <ParticlesBackground isDark={isDark} />

      {/* Header */}
      <header style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        backgroundColor: headerBg,
        borderBottom: `1px solid ${border}`,
        position: "sticky", top: 0, zIndex: 10,
      }} className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", flexShrink: 0,
            }}>✍️</div>
            <h1 style={{ fontWeight: 700, fontSize: "18px", color: isDark ? "#f1f5f9" : "#1e1b4b" }}>
              WriteAI
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={toggle}
              style={{
                color: textSecondary, border: `1px solid ${border}`,
                backgroundColor: cardBg, backdropFilter: "blur(8px)", cursor: "pointer",
              }}
              className="text-sm px-3 py-1.5 rounded-lg transition"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>

            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(99,102,241,0.4)";
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8" style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          marginBottom: "28px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>
          <h2 style={{ color: textPrimary, fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>
            My Documents
          </h2>
          <p style={{ color: textSecondary, fontSize: "14px" }}>
            {documents.length === 0
              ? "Start writing something amazing"
              : `${documents.length} document${documents.length > 1 ? "s" : ""}`}
          </p>
        </div>

        <div style={{
          marginBottom: "24px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
        }}>
          <button
            onClick={createDocument}
            disabled={creating}
            style={{
              background: creating ? "#4f46e5" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white", border: "none",
              padding: "10px 20px", borderRadius: "10px",
              fontSize: "14px", fontWeight: 600,
              cursor: creating ? "not-allowed" : "pointer",
              opacity: creating ? 0.7 : 1,
              boxShadow: "0 4px 15px rgba(99,102,241,0.35)",
              transition: "all 0.2s ease",
            }}
          >
            {creating ? "Creating..." : "+ New Document"}
          </button>
        </div>

        {documents.length === 0 ? (
          <div style={{
            textAlign: "center", paddingTop: "64px", paddingBottom: "64px",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.4s ease 0.2s",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
            <p style={{ color: textSecondary, fontSize: "16px", marginBottom: "4px" }}>No documents yet</p>
            <p style={{ color: textMuted, fontSize: "14px" }}>Create your first document to get started</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {documents.map((doc, i) => (
              <div
                key={doc.id}
                onClick={() => router.push(`/editor/${doc.id}`)}
                style={{
                  backgroundColor: cardBg,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: `1px solid ${border}`,
                  borderRadius: "14px",
                  padding: "18px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${0.1 + i * 0.05}s`,
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 8px 30px rgba(99,102,241,0.15)"
                    : "0 8px 30px rgba(99,102,241,0.12)";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = border;
                }}
              >
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)",
                }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
                      background: isDark
                        ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))"
                        : "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px",
                    }}>📝</div>
                    <div>
                      <h3 style={{ color: textPrimary, fontWeight: 600, fontSize: "15px", marginBottom: "2px" }}>
                        {doc.title}
                      </h3>
                      <p style={{ color: textMuted, fontSize: "12px" }}>
                        Updated {formatDate(doc.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteDocument(doc.id, e)}
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#ef4444", cursor: "pointer",
                      padding: "6px 8px", borderRadius: "8px",
                      fontSize: "15px", transition: "all 0.2s", flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    title="Delete document"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Profile modal — centralizado com blur */}
      {showProfileModal && (
        <div
          onClick={() => setShowProfileModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: modalBg,
              border: `1px solid ${border}`,
              borderRadius: "20px",
              padding: "28px",
              width: "280px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
              animation: "modalIn 0.2s ease",
            }}
          >
            {/* Avatar grande centralizado */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "22px", fontWeight: 700,
                boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
                marginBottom: "12px",
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <p style={{ color: textPrimary, fontWeight: 700, fontSize: "16px", marginBottom: "2px" }}>
                {user?.name}
              </p>
              <p style={{ color: textMuted, fontSize: "13px" }}>{user?.email}</p>
            </div>

            <div style={{ borderTop: `1px solid ${border}`, paddingTop: "16px" }}>
              <button
                onClick={() => { setShowProfileModal(false); logout(); }}
                style={{
                  width: "100%", padding: "10px 12px",
                  borderRadius: "10px", border: "none",
                  background: "rgba(239,68,68,0.08)",
                  color: "#ef4444", fontSize: "14px", fontWeight: 500,
                  cursor: "pointer", textAlign: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
              >
                🚪 Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>

      {confirmId && (
        <ConfirmModal
          message="This action cannot be undone. Are you sure you want to delete this document?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
          isDark={isDark}
        />
      )}
    </div>
  );
}