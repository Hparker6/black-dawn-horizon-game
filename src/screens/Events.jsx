import * as t from "../styles/tokens.js";
import { classifyChoices } from "../engine/events.js";
import { eventPresentation } from "../engine/narrative-tier.js";
import { prefersReducedMotion } from "../engine/motion.js";
import EventReaction from "../components/EventReaction.jsx";
import Reveal from "../components/Reveal.jsx";

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
//
// "check" (risky) used to be a solid blood-red filled circle around a die
// glyph — which, glyph-rendering aside, is exactly the universal "stop/
// forbidden/error" visual (solid red circle + X-ish mark), so players read
// it as blocked and avoided clicking it. A risky choice must look
// CLICKABLE and tempting, just dangerous — so it's now an amber hazard
// roundel (same warm gold as the CHECK badge below) with a red warning
// glyph, full opacity, solid border, no dashing, no reduced contrast —
// nothing here says "can't," only "should you." Only "locked" gets the
// dead/disabled treatment (dashed border, diagonal hazard stripes, reduced
// opacity, not-allowed cursor) so the two never read alike.
// "keepsake" (a choice unlocked by the drafted keepsake — see classifyChoices
// in engine/events.js) gets its own quiet gold treatment: it's an emotional
// beat, not a tactical unlock, so it shouldn't wear ready's confident solid
// green — warm, slightly precious, clearly still clickable.
function kindMeta(kind) {
  if (kind === "locked") return { icon: "🔒", roundelBg: t.badgeLockedBg, roundelColor: t.muted, roundelBorder: t.borderDashed };
  if (kind === "ready") return { icon: "✦", roundelBg: t.green, roundelColor: t.paper, roundelBorder: t.green };
  if (kind === "keepsake") return { icon: "❧", roundelBg: t.highlightBg, roundelColor: t.goldDark, roundelBorder: t.gold };
  if (kind === "check") return { icon: "⚠", roundelBg: t.badgeCheckBg, roundelColor: t.blood, roundelBorder: t.blood };
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
  if (kind === "keepsake") return { ...base, cursor: "pointer", border: `1px solid ${t.gold}`, background: t.highlightBg, boxShadow: "0 2px 0 #a8801f" };
  // Full-strength red border (not the old 45%-opacity wash) so it reads as
  // vividly dangerous, but the fill stays light and the button is exactly
  // as clickable/full-opacity as every non-locked kind — alive, not blocked.
  if (kind === "check") return { ...base, cursor: "pointer", border: `1px solid ${t.blood}`, background: t.checkBg, boxShadow: "0 2px 0 rgba(198,40,40,.5)" };
  return { ...base, cursor: "pointer", border: `1px solid ${t.safeBorder}`, background: t.safeBg, boxShadow: "0 2px 0 #6f8c6c" }; // plain/safe
}

function badgeStyle(kind) {
  const base = { alignSelf: "flex-start", fontSize: "10px", letterSpacing: "1.5px", padding: "2px 7px", borderRadius: "2px" };
  if (kind === "locked") return { ...base, color: t.muted, background: t.badgeLockedBg };
  if (kind === "ready") return { ...base, color: t.paper, background: t.badgeReadyBg };
  if (kind === "keepsake") return { ...base, color: t.goldDark, background: t.paper, border: `1px solid ${t.gold}` };
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
export default function Events({ event, traits, flags, identity, difficulty, reacting, reaction, identityFlavor, routeFlavor, reflection, onChoose, onReactionContinue }) {
  const classified = classifyChoices(event, traits, flags, difficulty, identity);
  // Narrative-tier intro treatment (engine/narrative-tier.js): a small
  // banner for hinge decisions and the finale, a hand-written note for
  // callbacks and keepsake memories, nothing for atmospheric events —
  // presentation only, derived from the event's existing shape.
  const presentation = eventPresentation(event);

  return (
    // Keyed by event id so each new entry re-animates — the same quiet
    // fade-up the lore pages use, no page-flip.
    <div key={event.id} style={{ flex: 1, display: "flex", flexDirection: "column", padding: "22px 26px 26px", animation: "bdhFadeUp .45s ease both" }}>
      {/* Natural height, top-anchored — the terse body text shouldn't stretch
          to fill the page. The gap it leaves is claimed deliberately below. */}
      <div style={{ overflow: "auto" }}>
        {presentation && presentation.banner && (
          <Reveal duration={500}>
            {/* Small-caps rule block, same quiet typography as the page
                header rows — a chapter marker, not an alert. */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", textAlign: "center", margin: "2px 0 26px" }}>
              <span style={{ width: "100%", maxWidth: "300px", height: "1px", background: t.borderSubtle }} />
              <span style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: "12px", letterSpacing: "4px", color: t.ink }}>{presentation.banner.title}</span>
              <span style={{ fontFamily: t.fontBody, fontSize: "12px", letterSpacing: "1px", color: t.muted }}>{presentation.banner.subtitle}</span>
              <span style={{ width: "100%", maxWidth: "300px", height: "1px", background: t.borderSubtle }} />
            </div>
          </Reveal>
        )}
        {presentation && presentation.note && (
          <Reveal duration={500}>
            {/* A scribbled aside above the heading — no border rule (unlike
                the mid-entry flavor lines below) so it reads as the hand
                pausing before the entry, not part of it. Keepsake notes take
                the same quiet gold as keepsake choices; callbacks stay in
                plain pencil. */}
            <p
              style={{
                fontFamily: t.fontHand,
                fontWeight: 500,
                fontSize: "17px",
                lineHeight: 1.4,
                color: presentation.tier === "keepsake" ? t.goldDark : t.muted,
                margin: "0 0 18px",
                transform: "rotate(-.35deg)",
              }}
            >
              {presentation.note}
            </p>
          </Reveal>
        )}
        {/* When a tier intro is present, the entry itself arrives a beat
            after it (label first, then the story) — atmospheric events keep
            the page's single fade exactly as before. */}
        <div style={presentation && !prefersReducedMotion() ? { animation: "bdhFadeUp .5s ease both", animationDelay: "260ms" } : undefined}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "38px", color: t.ink, lineHeight: 1, letterSpacing: "1px" }}>{event.title}</div>
        {/* A hand-drawn underline beneath the title — one imperfect stroke,
            the kind a tired hand leaves under a heading that matters. */}
        <svg viewBox="0 0 220 8" style={{ width: "200px", height: "8px", display: "block", margin: "6px 0 18px", opacity: 0.55 }} aria-hidden="true">
          <path d="M3 5 C50 2.2 120 6 217 3.6" fill="none" stroke="#2a2620" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {(event.body || []).map((line, i) => (
          <p key={i} style={{ fontSize: "17px", lineHeight: 1.7, color: "#2a2620", margin: "0 0 14px", textWrap: "pretty" }}>
            {line}
          </p>
        ))}
        {/* Identity flavor (engine/events.js's identityFlavorFor): the scene
            as this build perceives it — the dog smelling someone inside, the
            hunter counting figures first. Gold-edged (vs. the route/
            reflection lines' neutral dash) because it's the run's identity
            speaking, same accent as identity choice badges below. */}
        {identityFlavor && (
          <p style={{ fontFamily: t.fontHand, fontWeight: 500, fontSize: "17px", lineHeight: 1.4, color: t.goldDark, margin: "0 0 12px", borderLeft: `2px solid ${t.gold}`, paddingLeft: "10px", transform: "rotate(-.3deg)" }}>
            {identityFlavor}
          </p>
        )}
        {/* Occasional route callout (engine/pacing.js's routeFlavorFor) — only
            ever present when this event's type actually matches the route's
            premise, so it reads as the road commenting on what's happening
            right now, not a repeated tagline. Visible on every viewport
            width (unlike the wide-screen-only FIELD NOTE margin scrap in
            App.jsx), since the whole point is that every player feels it. */}
        {routeFlavor && (
          <p style={{ fontFamily: t.fontHand, fontWeight: 500, fontSize: "16px", lineHeight: 1.4, color: t.muted, margin: "0 0 12px", borderLeft: `2px solid ${t.borderDashed}`, paddingLeft: "10px", transform: "rotate(.25deg)" }}>
            {routeFlavor}
          </p>
        )}
        {/* A rare, quiet journal aside (engine/character-profile.js) — never
            a system-labeled callout, just another line of the same page, so
            it reads as the player's own hand noticing something rather than
            a game mechanic surfacing. */}
        {reflection && (
          <p style={{ fontFamily: t.fontHand, fontWeight: 500, fontSize: "16px", lineHeight: 1.4, color: t.muted, margin: "0 0 12px", borderLeft: `2px solid ${t.borderDashed}`, paddingLeft: "10px", transform: "rotate(-.25deg)" }}>
            {reflection}
          </p>
        )}
        </div>
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
