import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import socket from "../socket";
import { useTheme } from "../useTheme";
import CardDeck from "../components/CardDeck";
import ParticipantList from "../components/ParticipantList";
import ParticipantCards from "../components/ParticipantCards";
import IssuePanel from "../components/IssuePanel";
import VoteResults from "../components/VoteResults";
import ActionBar from "../components/ActionBar";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [room, setRoom] = useState(null);
  const [myVote, setMyVote] = useState(null);

  const [joinName, setJoinName] = useState("");
  const [joining, setJoining] = useState(false);
  const [ready, setReady] = useState(!!sessionStorage.getItem("pp_name"));

  const isHost = sessionStorage.getItem("pp_isHost") === "true";

  // Host can toggle observer mode — they won't vote and won't block the reveal
  const [skipVoting, setSkipVoting] = useState(
    () => sessionStorage.getItem("pp_skipVoting") !== "false"
  );
  const toggleSkipVoting = () => {
    const next = !skipVoting;
    setSkipVoting(next);
    sessionStorage.setItem("pp_skipVoting", String(next));
  };

  useEffect(() => {
    if (!ready) return;
    socket.connect();
    socket.emit("join-room", {
      roomId,
      name: sessionStorage.getItem("pp_name"),
      isHost: sessionStorage.getItem("pp_isHost") === "true",
    });
    socket.on("room-update", (updatedRoom) => setRoom(updatedRoom));
    socket.on("error", ({ message }) => { toast.error(message); navigate("/"); });
    return () => {
      socket.off("room-update");
      socket.off("error");
      socket.disconnect();
    };
  }, [roomId, ready]);

  useEffect(() => {
    if (room && !room.revealed) setMyVote(null);
  }, [room?.revealed, room?.currentIssueIndex]);

  const handleVote = useCallback((value) => {
    setMyVote(value);
    socket.emit("vote", { roomId, value });
  }, [roomId]);

  const handleReveal      = () => socket.emit("reveal-votes", { roomId });
  const handleNext        = () => socket.emit("next-issue",   { roomId });
  const handleAddIssue    = (title) => socket.emit("add-issue", { roomId, title });
  const handlePlayAgain   = () => socket.emit("play-again",   { roomId });
  const handleCancelRound = () => socket.emit("next-issue",   { roomId }); // skip = advance
  const handleAcceptRound = (result) => {
    socket.emit("accept-round", { roomId, result });
  };

  const shareUrl = window.location.href;
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); };

  /* ── INVITE-LINK JOIN SCREEN ── */
  async function handleInviteJoin(e) {
    e.preventDefault();
    if (!joinName.trim()) return toast.error("Enter your name");
    setJoining(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/rooms/${roomId}`);
      if (!res.ok) { toast.error("Room not found or has expired"); navigate("/"); return; }
      sessionStorage.setItem("pp_name", joinName.trim());
      sessionStorage.setItem("pp_isHost", "false");
      setReady(true);
    } catch {
      toast.error("Could not connect to room");
    } finally {
      setJoining(false);
    }
  }

  if (!ready) return (
    <div style={j.page}>
      <button className="btn-theme" onClick={toggle} title="Toggle theme" style={j.themeBtn}>
        {theme === "dark" ? "☀" : "☾"}
      </button>
      <div style={j.decorCard}>♠</div>
      <div style={j.content} className="fade-up">
        <div style={j.hero}>
          <p style={j.eyebrow}>You've been invited</p>
          <h1 style={j.title}>Join<br />Session</h1>
          <p style={j.roomPill}>
            <span style={j.roomPillLabel}>Room</span>
            <span style={j.roomPillCode}>{roomId}</span>
          </p>
        </div>
        <div style={j.card}>
          <form onSubmit={handleInviteJoin} style={j.form}>
            <div style={j.field}>
              <label style={j.label}>Your Name</label>
              <input
                className="input"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="e.g. Ravi"
                maxLength={30}
                autoFocus
              />
            </div>
            <button className="btn-primary" type="submit" disabled={joining}
              style={{ width: "100%", marginTop: 16, padding: "14px 28px" }}>
              {joining ? "···" : "Enter Room"}
            </button>
          </form>
        </div>
        <p style={j.footer}>No account needed</p>
      </div>
    </div>
  );

  /* ── CONNECTING ── */
  if (!room) return (
    <div style={s.loading}>
      <div style={s.spinner} />
      <p style={{ color: "var(--text-4)", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Connecting...
      </p>
    </div>
  );

  /* ── MAIN ROOM ── */
  const participants = Object.entries(room.participants).map(([id, p]) => ({ id, ...p }));
  const currentIssue = room.issues[room.currentIssueIndex];
  // Exclude the host from the allVoted gate when they have opted to skip voting
  const voters = isHost && skipVoting
    ? participants.filter((p) => !p.isHost)
    : participants;
  const allVoted = voters.length > 0 && voters.every((p) => p.vote !== null);
  const hasNextIssue = room.currentIssueIndex < room.issues.length - 1;

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.logoMark}>♣</span>
          <div style={s.headerDivider} />
          <span style={s.roomCode}>{roomId}</span>
          {isHost && <span style={s.hostBadge}>HOST</span>}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Observer toggle — host only */}
          {isHost && (
            <button
              className="btn-ghost"
              onClick={toggleSkipVoting}
              title={skipVoting ? "Join voting" : "Skip voting (observer mode)"}
              style={{
                fontSize: 11,
                ...(skipVoting ? { color: "var(--estimating-color)", borderColor: "var(--estimating-color)" } : {}),
              }}
            >
              {skipVoting ? "👁 Observing" : "Skip Voting"}
            </button>
          )}
          <button className="btn-ghost" onClick={copyLink} style={{ fontSize: 11 }}>Invite</button>
          <button className="btn-theme" onClick={toggle} title="Toggle theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={s.layout}>
        {/* Left: Issues */}
        <aside style={s.aside}>
          <IssuePanel
            issues={room.issues}
            currentIndex={room.currentIssueIndex}
            isHost={isHost}
            onAddIssue={handleAddIssue}
          />
        </aside>

        {/* Center: Voting area */}
        <div style={s.centerCol}>
          <main style={s.main}>
            {currentIssue ? (
              <>
                <div style={s.issueHeader}>
                  <span style={s.issueLabel}>Estimating</span>
                  <h2 style={s.issueTitle}>{currentIssue.title}</h2>
                  <div style={s.issueDivider} />
                </div>

                {/* Card strip — hide after reveal, and hide for observing host */}
                {!room.revealed && !(isHost && skipVoting) && (
                  <CardDeck myVote={myVote} onVote={handleVote} />
                )}

                {/* Observer banner — shown when host has skipped voting */}
                {isHost && skipVoting && !room.revealed && (
                  <div style={s.observerBanner}>
                    <span style={s.observerIcon}>👁</span>
                    <span style={s.observerText}>Observer mode — you are not voting this round</span>
                  </div>
                )}

                {/* ── Participant flip-cards ── */}
                {/* Always visible: face-down while voting, flip to face-up on reveal */}
                <ParticipantCards
                  participants={participants}
                  revealed={room.revealed}
                />

                {/* Stats row (avg / consensus) — only after reveal */}
                {room.revealed && (
                  <VoteResults participants={participants} />
                )}
              </>
            ) : (
              <div style={s.noIssue}>
                <div style={s.emptyCard}>♠</div>
                <p style={{ color: "var(--text-4)", marginTop: 20, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {isHost ? "Add an issue to begin" : "Waiting for host..."}
                </p>
              </div>
            )}
          </main>

          {/* ── Action Bar (reference-style, host only) ── */}
          <ActionBar
            isHost={isHost}
            revealed={room.revealed}
            participants={participants}
            currentIssue={currentIssue}
            hasNextIssue={hasNextIssue}
            allVoted={allVoted}
            onReveal={handleReveal}
            onPlayAgain={handlePlayAgain}
            onAcceptRound={handleAcceptRound}
            onCancelRound={handleCancelRound}
          />
        </div>

        {/* Right: Participants */}
        <aside style={{ ...s.aside, borderLeft: "1px solid var(--border-lo)", borderRight: "none" }}>
          <ParticipantList participants={participants} revealed={room.revealed} />
        </aside>
      </div>
    </div>
  );
}

/* ── Invite join styles ── */
const j = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "var(--bg)", position: "relative", overflow: "hidden" },
  themeBtn: { position: "fixed", top: 20, right: 24, zIndex: 100 },
  decorCard: { position: "fixed", right: "-60px", top: "50%", transform: "translateY(-50%) rotate(15deg)", width: 280, height: 380, background: "var(--ink)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, color: "var(--ink-inv)", fontFamily: "serif", lineHeight: 1, opacity: 0.04, pointerEvents: "none" },
  content: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 36, width: "100%", maxWidth: 420 },
  hero: { textAlign: "center" },
  eyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 12, fontFamily: "'Inter', sans-serif" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 64, fontWeight: 900, lineHeight: 1.0, color: "var(--ink)", letterSpacing: "-1px" },
  roomPill: { display: "inline-flex", alignItems: "center", gap: 10, marginTop: 20, padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 2, background: "var(--surface)" },
  roomPillLabel: { fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "'Inter', sans-serif" },
  roomPillCode: { fontSize: 14, fontWeight: 700, color: "var(--ink)", fontFamily: "'Playfair Display', serif", letterSpacing: "0.15em" },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "36px 32px", width: "100%", boxShadow: "0 32px 64px var(--shadow-card)" },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 11, fontWeight: 600, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.12em" },
  footer: { color: "var(--text-5)", fontSize: 12, letterSpacing: "0.04em" },
};

/* ── Room styles ── */
const s = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" },
  loading: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, background: "var(--bg)" },
  spinner: { width: 28, height: 28, border: "2px solid var(--spinner-track)", borderTopColor: "var(--spinner-head)", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: "1px solid var(--border-lo)", background: "var(--bg)" },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { fontSize: 22, color: "var(--ink)", fontFamily: "serif", lineHeight: 1 },
  headerDivider: { width: 1, height: 20, background: "var(--border)" },
  roomCode: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.15em", color: "var(--ink)" },
  hostBadge: { background: "transparent", color: "var(--text-4)", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 2, letterSpacing: "0.15em", border: "1px solid var(--border-hi)" },
  layout: { display: "flex", flex: 1, overflow: "hidden" },
  aside: { width: 240, borderRight: "1px solid var(--border-lo)", padding: "24px 18px", background: "var(--bg)", overflowY: "auto" },
  centerCol: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  main: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 28px 24px", gap: 32, background: "var(--bg-alt)", overflowY: "auto" },
  issueHeader: { textAlign: "center", width: "100%", maxWidth: 600 },
  issueLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "var(--estimating-color)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    fontFamily: "'Inter', sans-serif",
  },
  issueTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26,
    fontWeight: 700,
    marginTop: 8,
    color: "var(--estimating-color)",
    lineHeight: 1.3,
  },
  issueDivider: { width: 40, height: 1, background: "var(--border)", margin: "16px auto 0" },
  noIssue: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" },
  emptyCard: { width: 100, height: 140, border: "1px solid var(--border)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "var(--border-hi)", fontFamily: "serif" },
  observerBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 20px",
    border: "1px dashed var(--border-hi)",
    borderRadius: 6,
    background: "transparent",
    maxWidth: 400,
  },
  observerIcon: { fontSize: 18, opacity: 0.6 },
  observerText: {
    fontSize: 13,
    color: "var(--text-4)",
    letterSpacing: "0.03em",
    fontStyle: "italic",
  },
};
