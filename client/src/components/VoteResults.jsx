import React from "react";

/**
 * VoteResults — stats only (avg + consensus).
 * The actual revealed cards are rendered by ParticipantCards with the flip animation.
 */
export default function VoteResults({ participants }) {
  const votes = participants.map((p) => p.vote).filter((v) => v !== null && v !== "?" && v !== "☕");
  const numericVotes = votes.filter((v) => typeof v === "number");

  if (numericVotes.length === 0) return null;

  const avg = (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1);

  const freq = {};
  votes.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  const maxCount = Math.max(...Object.values(freq));
  const consensus = maxCount > 1 ? Object.keys(freq).find((k) => freq[k] === maxCount) : null;

  return (
    <div style={s.statsRow}>
      <div style={s.line} />
      <div style={s.stats}>
        <div style={s.stat}>
          <span style={s.label}>Average</span>
          <span style={s.value}>{avg}</span>
        </div>
        {consensus && (
          <>
            <div style={s.sep} />
            <div style={s.stat}>
              <span style={s.label}>Consensus</span>
              <span style={{ ...s.value, color: "var(--ink)" }}>{consensus}</span>
            </div>
          </>
        )}
      </div>
      <div style={s.line} />
    </div>
  );
}

const s = {
  statsRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    marginTop: 8,
  },
  line: { flex: 1, height: 1, background: "var(--border)" },
  stats: { display: "flex", alignItems: "center", padding: "0 28px" },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 20px" },
  sep: { width: 1, height: 32, background: "var(--border)" },
  label: { fontSize: 9, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.15em" },
  value: { fontSize: 32, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--text-3)", lineHeight: 1 },
};
