import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../useTheme";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState("create");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Enter your name");
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name.trim() }),
      });
      const data = await res.json();
      sessionStorage.setItem("pp_name", name.trim());
      sessionStorage.setItem("pp_isHost", "true");
      navigate(`/room/${data.roomId}`);
    } catch {
      toast.error("Failed to create room");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Enter your name");
    if (!roomCode.trim()) return toast.error("Enter room code");
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/rooms/${roomCode.trim().toUpperCase()}`);
      if (!res.ok) { toast.error("Room not found"); return; }
      sessionStorage.setItem("pp_name", name.trim());
      sessionStorage.setItem("pp_isHost", "false");
      navigate(`/room/${roomCode.trim().toUpperCase()}`);
    } catch {
      toast.error("Could not connect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      {/* Theme toggle — top right */}
      <button
        className="btn-theme"
        onClick={toggle}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        style={s.themeBtn}
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>

      {/* Decorative ghost card */}
      <div style={s.decorCard}>♣</div>

      <div style={s.content} className="fade-up">
        <div style={s.hero}>
          <p style={s.eyebrow}>Planning Poker</p>
          <h1 style={s.title}>Poker<br />Planner</h1>
          <p style={s.subtitle}>Real-time sprint estimation<br />for agile teams</p>
        </div>

        <div style={s.card}>
          {/* Tabs */}
          <div style={s.tabs}>
            {["create", "join"].map((t) => (
              <button
                key={t}
                style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
                onClick={() => setTab(t)}
              >
                {t === "create" ? "Create Room" : "Join Room"}
              </button>
            ))}
          </div>

          <form onSubmit={tab === "create" ? handleCreate : handleJoin} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Your Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ravi"
                maxLength={30}
              />
            </div>

            {tab === "join" && (
              <div style={s.field}>
                <label style={s.label}>Room Code</label>
                <input
                  className="input"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  maxLength={6}
                  style={{ letterSpacing: "0.3em", fontWeight: 700, fontSize: 16 }}
                />
              </div>
            )}

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: "100%", marginTop: 16, padding: "14px 28px", fontSize: 13 }}
            >
              {loading ? "···" : tab === "create" ? "Create Session" : "Join Session"}
            </button>
          </form>
        </div>

        <p style={s.footer}>No account needed · Free &amp; open source</p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    background: "var(--bg)",
  },
  themeBtn: {
    position: "fixed",
    top: 20,
    right: 24,
    zIndex: 100,
  },
  decorCard: {
    position: "fixed",
    right: "-60px",
    top: "50%",
    transform: "translateY(-50%) rotate(15deg)",
    width: 280,
    height: 380,
    background: "var(--ink)",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 120,
    color: "var(--ink-inv)",
    fontFamily: "serif",
    lineHeight: 1,
    opacity: 0.04,
    pointerEvents: "none",
    zIndex: 0,
  },
  content: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 40,
    width: "100%",
    maxWidth: 420,
  },
  hero: { textAlign: "center" },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "var(--text-4)",
    marginBottom: 12,
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 64,
    fontWeight: 900,
    lineHeight: 1.0,
    color: "var(--ink)",
    letterSpacing: "-1px",
  },
  subtitle: {
    color: "var(--text-4)",
    marginTop: 16,
    fontSize: 14,
    lineHeight: 1.6,
    fontWeight: 400,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "36px 32px",
    width: "100%",
    boxShadow: "0 0 0 1px rgba(128,96,32,0.04), 0 32px 64px var(--shadow-card)",
  },
  tabs: {
    display: "flex",
    gap: 0,
    marginBottom: 32,
    borderBottom: "1px solid var(--border)",
  },
  tab: {
    flex: 1,
    padding: "12px 0",
    background: "transparent",
    color: "var(--text-4)",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    border: "none",
    borderBottom: "2px solid transparent",
    marginBottom: "-1px",
    transition: "all 0.2s",
  },
  tabActive: {
    color: "var(--ink)",
    borderBottomColor: "var(--ink)",
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-4)",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  footer: { color: "var(--text-5)", fontSize: 12, letterSpacing: "0.04em" },
};
