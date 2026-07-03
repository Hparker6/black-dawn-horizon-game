import * as t from "../styles/tokens.js";

export default function Results({ died, day, tier, ending, newAch, loadout, log, shareLabel, onShare, onAgain }) {
  const headline = died ? "YOU DIED" : "YOU SURVIVED";
  const headColor = died ? t.blood : t.green;
  const rEnding = ending || (died ? "Died on the road" : "Reached the Coast");
  const hasNewAch = newAch > 0;
  const rNewAch = `✦  ${newAch} NEW MEDAL${newAch > 1 ? "S" : ""} EARNED`;
  const lastMsg = log[log.length - 1] || "";
  const recap = died
    ? `You left the city with ${loadout[0] ? loadout[0].name : "nothing"} and the will to see the coast. ${lastMsg} The black dawn kept you — but you lasted ${day} days, and that is more than most.`
    : `You walked out of the dead city with ${loadout[0] ? loadout[0].name : "little"} and a plan half-formed. ${lastMsg} ${day} days later, the horizon finally gave something back.`;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 24px 24px", animation: "bdhFadeUp .5s ease both" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: t.muted }}>FINAL ENTRY</div>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "42px", lineHeight: 1, marginTop: "8px", letterSpacing: "1px", color: headColor }}>{headline}</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "8px", marginTop: "10px" }}>
          <span style={{ fontSize: "62px", lineHeight: 1, color: t.ink }}>{day}</span>
          <span style={{ fontSize: "16px", letterSpacing: "2px", color: t.muted }}>DAYS</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px", margin: "20px 0 16px" }}>
        <div style={{ flex: 1, border: `1px dashed ${t.borderDashed}`, borderRadius: "2px", padding: "11px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", letterSpacing: "2px", color: t.muted }}>TIER</div>
          <div style={{ fontSize: "17px", color: t.gold, marginTop: "3px", letterSpacing: "1px" }}>{tier}</div>
        </div>
        <div style={{ flex: 1, border: `1px dashed ${t.borderDashed}`, borderRadius: "2px", padding: "11px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", letterSpacing: "2px", color: t.muted }}>ENDING</div>
          <div style={{ fontSize: "15px", color: t.ink, marginTop: "3px", letterSpacing: ".5px" }}>{rEnding}</div>
        </div>
      </div>
      {hasNewAch && (
        <div style={{ textAlign: "center", fontSize: "12px", letterSpacing: "2px", color: t.highlightText, background: t.highlightBg, border: `1px solid ${t.gold}`, borderRadius: "2px", padding: "8px", marginBottom: "14px" }}>
          {rNewAch}
        </div>
      )}
      <div style={{ fontSize: "10px", letterSpacing: "2px", color: t.muted, marginBottom: "6px" }}>LOADOUT CARRIED</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
        {loadout.map((it, i) => (
          <span key={i} style={{ fontSize: "11px", letterSpacing: ".5px", color: "#2a2620", border: `1px solid ${t.borderSubtle}`, borderRadius: "2px", padding: "4px 8px", background: t.lockedStripeA }}>
            {it.name}
          </span>
        ))}
      </div>
      <div style={{ borderLeft: `3px solid ${t.blood}`, padding: "2px 0 2px 14px", fontSize: "14px", lineHeight: 1.6, color: "#2a2620", fontStyle: "italic", textWrap: "pretty", flex: 1 }}>
        {recap}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "18px" }}>
        <button
          onClick={onShare}
          style={{ width: "100%", border: `1px solid ${t.ink}`, cursor: "pointer", background: t.paper, color: t.ink, fontFamily: t.fontBody, fontSize: "14px", letterSpacing: "2px", padding: "14px", borderRadius: "2px" }}
        >
          {shareLabel}
        </button>
        <button
          onClick={onAgain}
          style={{ width: "100%", border: "none", cursor: "pointer", background: t.ink, color: t.paper, fontFamily: t.fontBody, fontSize: "18px", letterSpacing: "3px", padding: "16px", borderRadius: "2px", boxShadow: "0 4px 0 #000" }}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
