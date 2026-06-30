import React from "react";

// Standard planning poker scale matching the reference image
const CARDS = [0, "½", 1, 2, 3, 5, 8, 13, 20, 40, 100, "?"];

export default function CardDeck({ myVote, onVote }) {
  return (
    <div style={s.wrapper}>
      {/* Horizontal scrollable card strip */}
      <div style={s.strip}>
        {CARDS.map((val) => {
          const selected = myVote === val;
          return (
            <button
              key={val}
              onClick={() => onVote(val)}
              style={{ ...s.card, ...(selected ? s.cardSelected : {}) }}
              title={`Vote ${val}`}
            >
              <span style={{
                ...s.cardValue,
                color: selected ? "var(--card-ink)" : "var(--text-2)",
              }}>
                {val}
              </span>
            </button>
          );
        })}
      </div>

      {myVote !== null && (
        <p style={s.voted}>
          You selected <strong style={{ color: "var(--ink)", fontFamily: "'Playfair Display', serif" }}>{myVote}</strong>
          {" "}— waiting for others
        </p>
      )}
    </div>
  );
}

const s = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  strip: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflowX: "auto",
    padding: "16px 20px",
    background: "var(--surface)",
    border: "1px solid var(--border-lo)",
    borderRadius: 6,
    width: "100%",
    maxWidth: 760,
    /* hide scrollbar but keep scroll */
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  card: {
    flexShrink: 0,
    width: 56,
    height: 72,
    background: "var(--bg)",
    border: "1px solid var(--border-hi)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  cardSelected: {
    background: "var(--card-face)",
    borderColor: "var(--border-hi)",
    transform: "translateY(-6px)",
    boxShadow: "0 8px 20px var(--shadow-card)",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: "'Playfair Display', serif",
    lineHeight: 1,
  },
  voted: {
    color: "var(--text-4)",
    fontSize: 13,
    letterSpacing: "0.04em",
  },
};
