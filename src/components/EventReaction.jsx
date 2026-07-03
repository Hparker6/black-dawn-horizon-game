import * as t from "../styles/tokens.js";

// Renders inline in place of the choice list — no modal, no second tap. Used
// for trait/plain choices, which resolve the instant they're picked; the
// event auto-advances after this has had a moment on screen (see App.jsx's
// REACTION_MS). Dice checks skip this entirely — their result lives in the
// DiceOverlay's own card, which still requires the deliberate CONTINUE tap.
export default function EventReaction({ reaction }) {
  if (!reaction) return null;
  const good = (reaction.health || 0) >= 0;
  const accent = good ? t.green : t.blood;
  const daysLabel = `+${reaction.days || 0} DAYS`;
  const hpLabel = reaction.health ? (reaction.health > 0 ? "+" + reaction.health : "" + reaction.health) + " CONDITION" : "NO HARM";

  return (
    <div
      style={{
        borderTop: `4px solid ${accent}`,
        background: t.highlightBg,
        borderRadius: "2px",
        padding: "16px 16px 14px",
        animation: "bdhFadeUp .3s ease both",
      }}
    >
      {reaction.tag && <div style={{ fontSize: "11px", letterSpacing: "2px", color: accent, marginBottom: "8px" }}>{reaction.tag}</div>}
      <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#2a2620", margin: "0 0 12px" }}>{reaction.msg}</p>
      <div style={{ display: "flex", gap: "10px", fontSize: "11px", letterSpacing: "1px", color: t.muted }}>
        <span>{daysLabel}</span>
        <span>{hpLabel}</span>
      </div>
    </div>
  );
}
