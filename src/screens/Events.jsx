import * as t from "../styles/tokens.js";
import { classifyChoices } from "../engine/events.js";
import EventReaction from "../components/EventReaction.jsx";

function choiceStyle(kind) {
  const base = {
    position: "relative",
    textAlign: "left",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontFamily: t.fontBody,
    borderRadius: "2px",
    padding: "12px 14px",
    transition: "transform .1s, background .15s",
  };
  if (kind === "locked")
    return { ...base, cursor: "not-allowed", border: `1px dashed ${t.borderDashed}`, background: `repeating-linear-gradient(45deg,${t.lockedStripeA} 0 6px,${t.lockedStripeB} 6px 12px)`, opacity: 0.72 };
  if (kind === "ready") return { ...base, cursor: "pointer", border: `1px solid ${t.green}`, background: t.readyBg, boxShadow: "0 2px 0 #2d5a3d" };
  return { ...base, cursor: "pointer", border: `1px solid ${t.ink}`, background: t.paper, boxShadow: "0 2px 0 #1a1a1a" };
}

function badgeStyle(kind) {
  const base = { alignSelf: "flex-start", fontSize: "10px", letterSpacing: "1.5px", padding: "2px 7px", borderRadius: "2px" };
  if (kind === "locked") return { ...base, color: t.muted, background: t.badgeLockedBg };
  if (kind === "ready") return { ...base, color: t.paper, background: t.badgeReadyBg };
  return { ...base, color: t.ink, background: t.badgeCheckBg };
}

// Day/Condition/Progress live in App.jsx as a persistent header that stays
// visible above the DiceOverlay (so the condition reaction is never hidden
// behind a modal). This screen owns only the event card itself: title, body,
// and either the choice list or — once a plain/trait choice has resolved —
// the inline EventReaction in its place.
export default function Events({ event, traits, difficulty, reacting, reaction, onChoose }) {
  const classified = classifyChoices(event, traits, difficulty);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 22px 22px" }}>
      {/* Natural height, top-anchored — the terse body text shouldn't stretch
          to fill the page. The gap it leaves is claimed deliberately below. */}
      <div style={{ overflow: "auto", animation: "bdhFadeUp .45s ease both" }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "28px", color: t.ink, lineHeight: 1, letterSpacing: "1px", marginBottom: "14px" }}>{event.title}</div>
        {(event.body || []).map((line, i) => (
          <p key={i} style={{ fontSize: "15px", lineHeight: 1.62, color: "#2a2620", margin: "0 0 12px", textWrap: "pretty" }}>
            {line}
          </p>
        ))}
      </div>
      {/* Claims the remaining space between the entry and the choices/reaction
          below, and — while a choice hasn't resolved yet — centers a small
          ornament in it, so the middle of the page reads as "designed pause,"
          not leftover void. Always present (even while reacting) so the
          reaction card still anchors to the bottom instead of floating. */}
      <div style={{ flex: 1, minHeight: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!reacting && <span style={{ color: t.borderSubtle, fontSize: "20px", letterSpacing: "10px", opacity: 0.7 }}>❖</span>}
      </div>
      {reacting ? (
        <EventReaction reaction={reaction} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
          {classified.map(({ choice, kind, badge, hasBadge, locked }, i) => (
            <button key={i} onClick={() => onChoose(choice, locked)} style={choiceStyle(kind)}>
              <span style={{ fontSize: "14px", lineHeight: 1.35, color: locked ? t.textLockedChoice : t.ink }}>{choice.text}</span>
              {hasBadge && <span style={badgeStyle(kind)}>{badge}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
