import * as t from "../styles/tokens.js";
import { ACH } from "../data/achievements.js";

function achStyle(un) {
  return {
    border: "1px solid " + (un ? t.gold : t.achBorderLocked),
    borderRadius: "3px",
    padding: "12px 11px",
    background: un ? t.rareBg : `repeating-linear-gradient(45deg,${t.achStripeA} 0 5px,${t.achStripeB} 5px 10px)`,
    opacity: un ? 1 : 0.66,
  };
}

export default function Achievements({ unlocked }) {
  const achCount = `${unlocked.length} / ${ACH.length}`;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "26px 20px 22px", animation: "bdhFadeUp .4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "32px", color: t.ink, letterSpacing: "1px" }}>MEDALS</div>
        <div style={{ fontSize: "12px", letterSpacing: "1px", color: t.muted }}>{achCount}</div>
      </div>
      <div style={{ fontSize: "12px", color: t.muted, fontStyle: "italic", margin: "2px 0 16px" }}>Earned in blood and bad weather.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "9px" }}>
        {ACH.map((a) => {
          const un = unlocked.includes(a.id);
          return (
            <div key={a.id} style={achStyle(un)}>
              <div style={{ fontSize: "20px", lineHeight: 1, marginBottom: "6px" }}>{un ? "✦" : "🔒"}</div>
              <div style={{ fontSize: "13px", letterSpacing: ".5px", color: un ? t.ink : t.rankMuted, lineHeight: 1.15 }}>{a.name}</div>
              <div style={{ fontSize: "10px", color: t.rankMuted, marginTop: "4px", lineHeight: 1.35, textWrap: "pretty" }}>{a.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
