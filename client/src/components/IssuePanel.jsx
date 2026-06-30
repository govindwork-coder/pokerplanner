import React, { useState } from "react";

export default function IssuePanel({ issues, currentIndex, isHost, onAddIssue }) {
  const [title, setTitle] = useState("");

  function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddIssue(title.trim());
    setTitle("");
  }

  return (
    <div style={s.wrapper}>
      <h3 style={s.heading}>Issues · {issues.length}</h3>

      {isHost && (
        <form onSubmit={handleAdd} style={s.form}>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Issue title..."
            style={{ fontSize: 13, padding: "9px 12px" }}
          />
          <button className="btn-primary" type="submit" style={{ padding: "9px 14px", fontSize: 11, whiteSpace: "nowrap" }}>
            + Add
          </button>
        </form>
      )}

      <div style={s.list}>
        {issues.map((issue, idx) => (
          <div
            key={issue.id}
            style={{
              ...s.issue,
              ...(idx === currentIndex ? s.issueCurrent : {}),
              ...(idx < currentIndex ? s.issueDone : {}),
            }}
          >
            <span style={s.num}>{idx + 1}</span>
            <span style={s.issueTitle}>{issue.title}</span>
            {issue.result && <span style={s.result}>{issue.result}</span>}
          </div>
        ))}
        {issues.length === 0 && (
          <p style={{ color: "var(--text-5)", fontSize: 12, letterSpacing: "0.06em" }}>
            {isHost ? "Add your first issue above" : "No issues yet"}
          </p>
        )}
      </div>
    </div>
  );
}

const s = {
  wrapper: { display: "flex", flexDirection: "column", gap: 16 },
  heading: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--text-4)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    fontFamily: "'Inter', sans-serif",
  },
  form: { display: "flex", gap: 8 },
  list: { display: "flex", flexDirection: "column", gap: 6 },
  issue: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 2,
    background: "transparent",
    border: "1px solid var(--border-lo)",
    transition: "all 0.15s ease",
  },
  issueCurrent: {
    borderColor: "var(--border-hi)",
    background: "var(--surface2)",
  },
  issueDone: { opacity: 0.35 },
  num: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--text-5)",
    minWidth: 16,
    fontFamily: "'Inter', sans-serif",
  },
  issueTitle: { flex: 1, fontSize: 13, fontWeight: 400, color: "var(--text-3)" },
  result: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--ink)",
    fontFamily: "'Playfair Display', serif",
    background: "var(--surface2)",
    padding: "2px 8px",
    borderRadius: 2,
    border: "1px solid var(--border)",
  },
};
