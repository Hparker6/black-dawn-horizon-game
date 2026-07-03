import * as t from "../styles/tokens.js";
import { ENDINGS } from "../data/endings.js";

function endingStyle(discovered) {
  return {
    border: "1px solid " + (discovered ? t.gold : t.achBorderLocked),
    borderRadius: "3px",
    padding: "12px 11px",
    background: discovered ? t.rareBg : `repeating-linear-gradient(45deg,${t.achStripeA} 0 5px,${t.achStripeB} 5px 10px)`,
    opacity: discovered ? 1 : 0.66,
  };
}

// Mirrors Achievements.jsx's layout (same grid-of-cards look, same
// locked/unlocked visual language) so the two collections read as one
// family. The difference: a *secret* ending (requiresFlags/excludeFlags in
// data/endings.js) hides its name and description behind "?????" until
// discovered — a base ending (from the final event's dice/trait choice)
// is always named, just shown locked/unlocked like a medal.
export default function EndingsCollection({ discovered }) {
  const count = `${discovered.length} / ${ENDINGS.length}`;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "26px 20px 22px", animation: "bdhFadeUp .4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "32px", color: t.ink, letterSpacing: "1px" }}>ENDINGS</div>
        <div style={{ fontSize: "12px", letterSpacing: "1px", color: t.muted }}>{count}</div>
      </div>
      <div style={{ fontSize: "12px", color: t.muted, fontStyle: "italic", margin: "2px 0 16px" }}>Every way the horizon has taken you, or let you go.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "9px" }}>
        {ENDINGS.map((e) => {
          const found = discovered.includes(e.id);
          const hidden = e.secret && !found;
          return (
            <div key={e.id} style={endingStyle(found)}>
              <div style={{ fontSize: "20px", lineHeight: 1, marginBottom: "6px" }}>{found ? "✦" : "🔒"}</div>
              <div style={{ fontSize: "13px", letterSpacing: ".5px", color: found ? t.ink : t.rankMuted, lineHeight: 1.15 }}>{hidden ? "?????" : e.label}</div>
              <div style={{ fontSize: "10px", color: t.rankMuted, marginTop: "4px", lineHeight: 1.35, textWrap: "pretty" }}>{hidden ? "?????" : e.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
