import React, { useEffect, useState } from "react";

/**
 * ParticipantCards
 * ─────────────────
 * Shows one card per participant below the card-selection strip.
 *
 * • Not voted yet  → dashed empty placeholder card
 * • Voted          → face-down card back (♠ pattern, value hidden)
 * • Revealed       → staggered 3-D flip → face-up showing the vote value
 */
export default function ParticipantCards({ participants, revealed }) {
  const [flipped, setFlipped] = useState(false);

  // Trigger flip shortly after "revealed" becomes true so CSS transition fires
  useEffect(() => {
    if (revealed) {
      const t = setTimeout(() => setFlipped(true), 60);
      return () => clearTimeout(t);
    } else {
      setFlipped(false);
    }
  }, [revealed]);

  if (participants.length === 0) return null;

  return (
    <div style={s.wrapper}>
      {participants.map((p, i) => {
        const hasVoted = p.vote !== null;
        const staggerClass = `stagger-${Math.min(i + 1, 8)}`;

        return (
          <div key={p.id} style={s.item}>
            {/* 3-D flip scene */}
            <div className="flip-scene">
              <div
                className={[
                  "flip-card",
                  staggerClass,
                  flipped && hasVoted ? "is-flipped" : "",
                ].join(" ")}
              >
                {/* ── Back face ── */}
                <div className={`flip-face flip-back${hasVoted ? "" : " is-empty"}`}>
                  <div className="flip-back-inner">
                    {hasVoted ? "♠" : "·"}
                  </div>
                </div>

                {/* ── Front face (revealed value) ── */}
                <div className="flip-face flip-front">
                  <span style={s.cornerTL}>{p.vote ?? "—"}</span>
                  <span style={s.value}>{p.vote ?? "—"}</span>
                  <span style={s.suit}>♠</span>
                </div>
              </div>
            </div>

            {/* Name label */}
            <span style={s.name}>{p.name}</span>
          </div>
        );
      })}
    </div>
  );
}

const s = {
  wrapper: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 18,
    padding: "12px 0",
  },
  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  /* Corner label on front face */
  cornerTL: {
    position: "absolute",
    top: 7,
    left: 8,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    color: "var(--card-corner)",
    lineHeight: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: "'Playfair Display', serif",
    color: "var(--card-ink)",
    lineHeight: 1,
  },
  suit: {
    position: "absolute",
    bottom: 14,
    fontSize: 9,
    color: "var(--card-suit-dim)",
    fontFamily: "serif",
  },
  name: {
    fontSize: 12,
    color: "var(--text-3)",
    fontWeight: 400,
    letterSpacing: "0.02em",
    maxWidth: 80,
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};
