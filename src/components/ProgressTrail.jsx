import * as t from "../styles/tokens.js";

// A thin filling trail showing how far into the run this event sits, so a
// run reads as a journey toward the coast rather than an open-ended stack
// of pages. `current`/`total` are 0-indexed position / event count for this
// run (runEvents), so the bar always reaches 100% on the final event.
export default function ProgressTrail({ current, total }) {
  const pct = total > 1 ? Math.min(100, Math.round((current / (total - 1)) * 100)) : 100;
  const eventsLeft = total - 1 - current;
  const near = eventsLeft <= 2;

  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ height: "3px", background: "#e4dcc6", borderRadius: "2px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: pct + "%",
            background: near ? t.blood : t.gold,
            transition: "width .6s ease, background .6s ease",
          }}
        />
      </div>
      <div
        style={{
          marginTop: "4px",
          fontSize: "10px",
          letterSpacing: "1.5px",
          color: near ? t.blood : t.muted,
          fontStyle: near ? "italic" : "normal",
        }}
      >
        {near ? "THE COAST IS NEAR" : `EVENT ${current + 1} OF ${total}`}
      </div>
    </div>
  );
}
