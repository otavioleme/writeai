"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AuthResponse } from "@/types";

function ParticlesBackground() {
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
        ctx.fillStyle = "rgba(99,102,241,0.4)";
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
            ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 120) * 0.12})`;
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password });
      login(data.token, { name: data.name, email: data.email });
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(99,102,241,0.25)",
  background: "#0f172a",
  color: "#f1f5f9",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
  boxSizing: "border-box" as const,
};

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060d1a 0%, #0f172a 50%, #0c1631 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", position: "relative",
    }}>
      <ParticlesBackground />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "420px",
        backgroundColor: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        padding: "40px 36px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

{/* Logo */}
<div style={{ marginBottom: "32px" }}>
  <span style={{
    fontWeight: 800,
    fontSize: "26px",
    background: "linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  }}>
    WriteAI
  </span>
</div>

        {/* Title */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "22px", marginBottom: "6px" }}>
            Welcome back
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
onFocus={(e) => {
  e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)";
  e.currentTarget.style.background = "#1e293b";
}}
onBlur={(e) => {
  e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)";
  e.currentTarget.style.background = "#0f172a";
}}
            />
          </div>

          <div>
            <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px", padding: "10px 14px",
              color: "#f87171", fontSize: "13px",
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "10px",
              border: "none",
              background: loading ? "#4f46e5" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 15px rgba(99,102,241,0.35)",
              transition: "all 0.2s ease",
              marginTop: "4px",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.5)"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 4px 15px rgba(99,102,241,0.35)"; }}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#475569", fontSize: "13px", marginTop: "24px" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}