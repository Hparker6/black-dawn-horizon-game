import * as t from "../styles/tokens.js";

// Renders inline in place of the choice list — no modal, no second tap to
// get here. Used for trait/plain choices, which resolve the instant they're
// picked; the reaction then stays on screen indefinitely — same as a dice
// check's result card — until the player taps CONTINUE or taps the card
// itself. Nothing here ever auto-dismisses.
export default function EventReaction({ reaction, onContinue }) {
  if (!reaction) return null;
  const good = (reaction.health || 0) >= 0;
  const accent = good ? t.green : t.blood;
  const daysLabel = `+${reaction.days || 0} DAYS`;
  const hpLabel = reaction.health ? (reaction.health > 0 ? "+" + reaction.health : "" + reaction.health) + " CONDITION" : "NO HARM";

  return (
    <div
      onClick={onContinue}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onContinue(); }}
      style={{
        borderTop: `4px solid ${accent}`,
        background: t.highlightBg,
        borderRadius: "2px",
        padding: "16px 16px 14px",
        cursor: "pointer",
        animation: "bdhFadeUp .3s ease both",
      }}
    >
      {/* The outcome tag as a quiet ink stamp — bordered, faintly tilted,
          pressed into the page rather than typeset on it. */}
      {reaction.tag && (
        <div
          style={{
            display: "inline-block",
            fontSize: "11px",
            letterSpacing: "2px",
            color: accent,
            border: `1.5px solid ${accent}`,
            borderRadius: "2px",
            padding: "3px 8px",
            marginBottom: "10px",
            transform: "rotate(-1.2deg)",
            opacity: 0.85,
          }}
        >
          {reaction.tag}
        </div>
      )}
      <p style={{ fontSize: "15px", lineHeight: 1.65, color: "#2a2620", margin: "0 0 12px" }}>{reaction.msg}</p>
      <div style={{ display: "flex", gap: "10px", fontSize: "11px", letterSpacing: "1px", color: t.muted, marginBottom: "14px" }}>
        <span>{daysLabel}</span>
        <span>{hpLabel}</span>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onContinue(); }}
        style={{
          width: "100%",
          border: "none",
          cursor: "pointer",
          background: t.ink,
          color: t.paper,
          fontFamily: t.fontBody,
          fontSize: "14px",
          letterSpacing: "3px",
          padding: "12px",
          borderRadius: "2px",
        }}
      >
        CONTINUE
      </button>
    </div>
  );
}
