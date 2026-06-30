import React from "react";

export default function ParticipantList({ participants, revealed }) {
  return (
    <div>
      <h3 style={s.heading}>Players · {participants.length}</h3>
      <div style={s.list}>
        {participants.map((p) => (
          <div key={p.id} style={s.item}>
            <div style={s.avatar}>{p.name[0].toUpperCase()}</div>
            <div style={s.info}>
              <span style={s.name}>{p.name}{p.isHost ? " ♛" : ""}</span>
              <span style={s.status}>
                {revealed
                  ? p.vote !== null
                    ? <strong style={{ color: "var(--ink)", fontFamily: "'Playfair Display', serif", fontSize: 15 }}>{p.vote}</strong>
                    : <span style={{ color: "var(--text-5)" }}>—</span>
                  : p.vote !== null
                    ? <span style={{ color: "var(--text-3)" }}>Voted ✓</span>
                    : <span style={{ color: "var(--text-5)" }}>Thinking...</span>
                }
              </span>
            </div>
          </div>
        ))}
        {participants.length === 0 && (
          <p style={{ color: "var(--text-5)", fontSize: 12, letterSpacing: "0.06em" }}>
            No one here yet
          </p>
        )}
      </div>
    </div>
  );
}

const s = {
  heading: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--text-4)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginBottom: 20,
    fontFamily: "'Inter', sans-serif",
  },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  item: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 0,
    background: "transparent",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
    color: "var(--text-3)",
    fontFamily: "'Inter', sans-serif",
  },
  info: { display: "flex", flexDirection: "column", gap: 2 },
  name: { fontSize: 13, fontWeight: 500, color: "var(--text-2)" },
  status: { fontSize: 12 },
};
