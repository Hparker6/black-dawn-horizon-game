import * as t from "../styles/tokens.js";
import { classifyChoices } from "../engine/events.js";
import EventReaction from "../components/EventReaction.jsx";

// One visual identity per choice kind — icon, roundel color, border/fill —
// so risk level reads before the text does. Never relies on color alone:
// every kind also gets a distinct icon shape and a plain-language badge
// (see badgeStyle + engine/events.js's classifyChoices, which now labels
// "plain" as SAFE instead of leaving it unbadged), so it stays legible for
// colorblind players. "safe" (neutral, no check, no requirement) and
// "ready" (a trait you own, no roll) both land in the green family on
// purpose — they're both low-risk — but stay visually distinct: ready is
// bold/confident (solid green fill, filled roundel), safe is quiet (pale
// wash, outline roundel), so "no risk" and "you're specifically equipped
// for this" don't blur into the same read.
function kindMeta(kind) {
  if (kind === "locked") return { icon: "🔒", roundelBg: t.badgeLockedBg, roundelColor: t.muted, roundelBorder: t.borderDashed };
  if (kind === "ready") return { icon: "✦", roundelBg: t.green, roundelColor: t.paper, roundelBorder: t.green };
  if (kind === "check") return { icon: "⚄", roundelBg: t.blood, roundelColor: t.paper, roundelBorder: t.blood };
  return { icon: "✓", roundelBg: t.safeBg, roundelColor: t.green, roundelBorder: t.safeBorder }; // plain/safe
}

function choiceStyle(kind) {
  const base = {
    position: "relative",
    textAlign: "left",
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontFamily: t.fontBody,
    borderRadius: "2px",
    padding: "13px 15px",
    transition: "transform .1s, background .15s",
  };
  if (kind === "locked")
    return { ...base, cursor: "not-allowed", border: `1px dashed ${t.borderDashed}`, background: `repeating-linear-gradient(45deg,${t.lockedStripeA} 0 6px,${t.lockedStripeB} 6px 12px)`, opacity: 0.72 };
  if (kind === "ready") return { ...base, cursor: "pointer", border: `1px solid ${t.green}`, background: t.readyBg, boxShadow: "0 2px 0 #2d5a3d" };
  if (kind === "check") return { ...base, cursor: "pointer", border: `1px solid ${t.checkBorder}`, background: t.checkBg, boxShadow: "0 2px 0 rgba(198,40,40,.35)" };
  return { ...base, cursor: "pointer", border: `1px solid ${t.safeBorder}`, background: t.safeBg, boxShadow: "0 2px 0 #6f8c6c" }; // plain/safe
}

function badgeStyle(kind) {
  const base = { alignSelf: "flex-start", fontSize: "10px", letterSpacing: "1.5px", padding: "2px 7px", borderRadius: "2px" };
  if (kind === "locked") return { ...base, color: t.muted, background: t.badgeLockedBg };
  if (kind === "ready") return { ...base, color: t.paper, background: t.badgeReadyBg };
  if (kind === "check") return { ...base, color: t.ink, background: t.badgeCheckBg };
  return { ...base, color: t.green, background: t.safeBg, border: `1px solid ${t.safeBorder}` }; // plain/safe
}

// Leading icon roundel — the first thing the eye hits scanning down the
// choice list, before any text. Same icon repeats in the badge text below
// so the cue never depends on noticing the roundel specifically.
function IconRoundel({ kind }) {
  const meta = kindMeta(kind);
  return (
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        marginTop: "1px",
        background: meta.roundelBg,
        color: meta.roundelColor,
        border: `1px solid ${meta.roundelBorder}`,
      }}
    >
      {meta.icon}
    </span>
  );
}

// Day/Condition/Progress live in App.jsx as a persistent header that stays
// visible above the DiceOverlay (so the condition reaction is never hidden
// behind a modal). This screen owns only the event card itself: title, body,
// and either the choice list or — once a plain/trait choice has resolved —
// the inline EventReaction in its place.
export default function Events({ event, traits, flags, difficulty, reacting, reaction, onChoose, onReactionContinue }) {
  const classified = classifyChoices(event, traits, flags, difficulty);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "18px 24px 24px" }}>
      {/* Natural height, top-anchored — the terse body text shouldn't stretch
          to fill the page. The gap it leaves is claimed deliberately below. */}
      <div style={{ overflow: "auto", animation: "bdhFadeUp .45s ease both" }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "32px", color: t.ink, lineHeight: 1, letterSpacing: "1px", marginBottom: "16px" }}>{event.title}</div>
        {(event.body || []).map((line, i) => (
          <p key={i} style={{ fontSize: "16px", lineHeight: 1.6, color: "#2a2620", margin: "0 0 12px", textWrap: "pretty" }}>
            {line}
          </p>
        ))}
      </div>
      {/* A classic scene-break rule — thin lines flanking the ornament — reads
          as a deliberate typographic pause between the entry and the choices
          right below it, instead of a lone mark adrift in a field. Fixed
          margin, not flex-grow: choices should sit close to the text they
          answer, not get pushed to the bottom of whatever room the panel
          happens to have. Always present (even while reacting) so the
          reaction card still gets the same breathing room. */}
      <div style={{ margin: "28px 0", minHeight: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!reacting && (
          <div style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", maxWidth: "260px", opacity: 0.7 }}>
            <span style={{ flex: 1, height: "1px", background: t.borderSubtle }} />
            <span style={{ color: t.borderSubtle, fontSize: "16px" }}>❖</span>
            <span style={{ flex: 1, height: "1px", background: t.borderSubtle }} />
          </div>
        )}
      </div>
      {reacting ? (
        <EventReaction reaction={reaction} onContinue={onReactionContinue} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {classified.map(({ choice, kind, badge, hasBadge, locked }, i) => (
            <button key={i} onClick={() => onChoose(choice, locked)} style={choiceStyle(kind)}>
              <IconRoundel kind={kind} />
              <span style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "15px", lineHeight: 1.35, color: locked ? t.textLockedChoice : t.ink }}>{choice.text}</span>
                {hasBadge && <span style={badgeStyle(kind)}>{badge}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
      {/* Absorbs whatever room is left after the entry+choices, so any extra
          page below reads as "this journal entry ended early, the page keeps
          going" rather than stretching the choices away from their text. */}
      <div style={{ flex: 1, minHeight: "16px" }} />
    </div>
  );
}
