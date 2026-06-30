import React, { useState, useEffect } from "react";

/**
 * ActionBar — sticky bottom bar matching the reference UI.
 *
 * Pre-reveal (host):   [? input]  [Accept round]  [Play again]  [Reveal cards]  [Cancel round]
 * Post-reveal (host):  [5 input]  [Accept round]  [Play again]  [Reveal cards]  [Cancel round]
 * Non-host:            (nothing shown — host controls the round)
 */
export default function ActionBar({
  isHost,
  revealed,
  participants,
  currentIssue,
  hasNextIssue,
  onReveal,
  onPlayAgain,
  onAcceptRound,
  onCancelRound,
  allVoted,
}) {
  // Auto-populate result with consensus or avg after reveal
  const votes = participants.map((p) => p.vote).filter((v) => v !== null && v !== "?" && v !== "☕");
  const numericVotes = votes.filter((v) => typeof v === "number");
  const avg = numericVotes.length > 0
    ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
    : "";
  const freq = {};
  votes.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  const maxCount = Object.values(freq).length ? Math.max(...Object.values(freq)) : 0;
  const consensus = maxCount > 1 ? String(Object.keys(freq).find((k) => freq[k] === maxCount)) : "";

  const autoValue = consensus || avg || "";

  const [result, setResult] = useState(autoValue);

  useEffect(() => {
    setResult(autoValue);
  }, [autoValue]);

  if (!isHost || !currentIssue) return null;

  return (
    <div style={s.bar}>
      {/* Result input */}
      <input
        style={s.resultInput}
        value={result}
        onChange={(e) => setResult(e.target.value)}
        placeholder="?"
        maxLength={6}
        title="Final estimate for this issue"
      />

      {/* Accept round — saves result & advances */}
      <button
        style={s.btnAccept}
        onClick={() => onAcceptRound(result)}
        disabled={!revealed || !hasNextIssue}
        title={!revealed ? "Reveal votes first" : !hasNextIssue ? "No more issues" : "Accept and move to next issue"}
      >
        Accept round
      </button>

      {/* Play again — resets votes, same issue */}
      <button
        style={s.btnSecondary}
        onClick={onPlayAgain}
        title="Reset votes and vote again on this issue"
      >
        Play again
      </button>

      {/* Reveal cards */}
      <button
        style={{ ...s.btnSecondary, opacity: revealed || !allVoted ? 0.4 : 1 }}
        onClick={onReveal}
        disabled={revealed || !allVoted}
        title={revealed ? "Already revealed" : !allVoted ? "Waiting for all votes" : "Reveal all votes"}
      >
        {!revealed && !allVoted
          ? `Waiting · ${participants.filter(p => p.vote !== null).length}/${participants.length}`
          : "Reveal cards"}
      </button>

      {/* Cancel round — reset and skip to next */}
      <button
        style={s.btnCancel}
        onClick={onCancelRound}
        title="Skip this issue"
      >
        Cancel round
      </button>
    </div>
  );
}

const s = {
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 24px",
    borderTop: "1px solid var(--border-lo)",
    background: "var(--surface)",
    flexWrap: "wrap",
  },
  resultInput: {
    width: 72,
    padding: "9px 12px",
    background: "transparent",
    border: "1px solid var(--border-hi)",
    borderRadius: 4,
    color: "var(--ink)",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Playfair Display', serif",
    textAlign: "center",
    letterSpacing: "0.05em",
    outline: "none",
    transition: "border-color 0.15s",
    flexShrink: 0,
  },
  btnAccept: {
    padding: "9px 18px",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.04em",
    border: "none",
    cursor: "pointer",
    background: "var(--btn-primary-bg)",
    color: "var(--btn-primary-fg)",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.15s ease",
    opacity: 1,
  },
  btnSecondary: {
    padding: "9px 18px",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "0.04em",
    border: "1px solid var(--border-hi)",
    cursor: "pointer",
    background: "transparent",
    color: "var(--text-2)",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.15s ease",
  },
  btnCancel: {
    padding: "9px 18px",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "0.04em",
    border: "1px solid var(--border-hi)",
    cursor: "pointer",
    background: "transparent",
    color: "var(--text-3)",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.15s ease",
  },
};
