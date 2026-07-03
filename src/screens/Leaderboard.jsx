import * as t from "../styles/tokens.js";
import { LEADERS } from "../data/leaderboard.js";
import { buildLeaderboard } from "../engine/scoring.js";

function rowStyle(you) {
  return {
    display: "flex",
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: "2px",
    background: you ? t.highlightBg : "transparent",
    border: "1px solid " + (you ? t.gold : "transparent"),
    borderBottom: `1px dotted ${t.achBorderLocked}`,
  };
}

export default function Leaderboard({ best }) {
  const top = buildLeaderboard(LEADERS, best);
  const leaderFoot = best > 0 ? `Your best: ${best} days` : "Survive a run to make the wall.";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "26px 22px 22px", animation: "bdhFadeUp .4s ease both" }}>
      <div style={{ fontFamily: t.fontDisplay, fontSize: "32px", color: t.ink, letterSpacing: "1px" }}>THE ROSTER</div>
      <div style={{ fontSize: "12px", color: t.muted, fontStyle: "italic", margin: "2px 0 16px" }}>Names on the wall. Days survived.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {top.map((row, i) => (
          <div key={i} style={rowStyle(!!row.you)}>
            <span style={{ fontSize: "13px", color: t.rankMuted, width: "26px" }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ flex: 1, fontSize: "14px", letterSpacing: ".5px", color: row.you ? t.highlightText : t.ink }}>{row.name}</span>
            <span style={{ fontSize: "10px", letterSpacing: "1px", color: t.rankMuted, marginRight: "12px" }}>{row.note}</span>
            <span style={{ fontSize: "17px", color: t.ink, width: "34px", textAlign: "right" }}>{row.days}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: "11px", color: t.muted, textAlign: "center", marginTop: "16px", fontStyle: "italic" }}>{leaderFoot}</div>
    </div>
  );
}
