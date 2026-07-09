import * as t from "../styles/tokens.js";
import { INTRO_SCREENS } from "../data/intro.js";
import RouteSelect from "./RouteSelect.jsx";
import PageTransition from "../components/PageTransition.jsx";
import Reveal from "../components/Reveal.jsx";
import { prefersReducedMotion } from "../engine/motion.js";

// Lore ink: darker than the app's default t.ink specifically for long-form
// reading on textured paper, with a faint paper-highlight shadow that lifts
// the letterforms without reading as an effect.
const LORE_INK = "#2a1d12";
const LORE_SHADOW = "0 1px 0 rgba(255,255,255,.45)";

// Reveal cadence for a page's blocks (title -> body -> continue), tuned to
// finish just as the page-turn that delivered the page completes.
const REVEAL_STEP_MS = 130;

// A one-off cinematic beat, not a log page — no RECOVERED LOG header, no
// skip link, no ruled dividers; the artwork is the page. Same full-bleed
// treatment as the lore page's background so the two beats read as a set,
// but here the art runs at full strength (it IS the content) and the
// journal fragments sit on a parchment veil in the character's hand —
// dark ink on paper, not white script fighting the illustration. Advances
// on click/tap anywhere; the change of pages is PageTransition's job (see
// the export below), not this component's. Entrance is staggered: artwork
// first, then the journal lines land one at a time (reading pace), then
// the continue hint.
function LeavingHomeScreen({ screen, onContinue }) {
  const lineDelay = (i) => 450 + i * 2 * REVEAL_STEP_MS;
  const continueDelay = lineDelay(screen.journal.length) + 250;

  return (
    <div
      onClick={onContinue}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onContinue();
      }}
      style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", padding: "40px 34px 30px", cursor: "pointer" }}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", animation: prefersReducedMotion() ? "none" : "bdhOverlay .8s ease both" }}>
        <img
          src={screen.image}
          alt={screen.imageAlt}
          decoding="async"
          draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", userSelect: "none" }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }} />
        {/* Journal fragments, bottom-left over the open grass — same
            parchment-veil treatment as the lore page so the handwriting
            stays readable no matter how the cover-crop lands. */}
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "420px",
            background: "rgba(250,246,236,.68)",
            boxShadow: "0 0 16px 10px rgba(250,246,236,.55)",
            borderRadius: "8px",
            padding: "20px 26px",
            boxSizing: "border-box",
          }}
        >
          {screen.journal.map((line, i) => (
            <Reveal key={i} delay={lineDelay(i)} duration={650}>
              <p
                style={{
                  margin: i === 0 ? 0 : "12px 0 0",
                  fontFamily: t.fontHand,
                  fontWeight: 600,
                  fontSize: "clamp(19px,2.3vw,24px)",
                  lineHeight: 1.5,
                  color: LORE_INK,
                  textShadow: LORE_SHADOW,
                }}
              >
                {line}
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={continueDelay} style={{ textAlign: "center", marginTop: "18px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              background: "rgba(250,246,236,.68)",
              boxShadow: "0 0 14px 10px rgba(250,246,236,.55)",
              borderRadius: "6px",
              fontSize: "12px",
              letterSpacing: "2px",
              color: t.rankMuted,
            }}
          >
            TAP TO CONTINUE &rsaquo;
          </div>
        </Reveal>
      </div>
    </div>
  );
}

// A recovered-log page: same hairline-divider composition as before, but
// built for effortless reading — the display font is reserved for the beat
// title, and the log body itself is set in the app's typewriter face at
// reading size on a soft parchment veil (a translucent paper wash with a
// feathered glow) that quiets the coffee-ring/texture noise behind the
// text without hiding the page. Tap-anywhere-to-continue (plus an explicit
// affordance) — no timer, ever; the staggered reveals never gate input.
//
// screen.art (optional) is full-page background artwork behind the log:
// dimmed + slightly desaturated, feathered into the paper at the edges by a
// radial wash, and fading in a beat after the page so the words register
// first and the art surfaces behind them. It's absolutely positioned
// (zero layout shift), decorative (aria-hidden), and sits under the
// parchment veil, which is what keeps the body text effortless to read.
function AtmosphereScreen({ screen, onContinue, onSkip, showSkip }) {
  const bodyDelay = (i) => 360 + i * REVEAL_STEP_MS;
  const continueDelay = bodyDelay(screen.body.length) + 220;

  return (
    <div
      onClick={onContinue}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onContinue();
      }}
      style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", padding: "48px 34px 38px", cursor: "pointer" }}
    >
      {screen.art && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
            animation: prefersReducedMotion() ? "none" : "bdhOverlay .9s ease both",
            animationDelay: "150ms",
          }}
        >
          <img
            src={screen.art}
            alt=""
            decoding="async"
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(.82) sepia(.08)",
              opacity: 0.82,
              userSelect: "none",
            }}
          />
          {/* Gentle edge feather only — the art carries its own aged-paper
              border, so this just melts the cover-crop into the panel
              instead of washing the whole illustration out. */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 120% at 50% 45%, transparent 62%, ${t.paper} 100%)`, opacity: 0.45 }} />
        </div>
      )}

      {/* Above-the-art layer: everything readable lives here so the
          absolutely-positioned artwork can never paint over it. */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <Reveal duration={450} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", letterSpacing: "3px", color: t.muted }}>
          <span>RECOVERED LOG</span>
          {showSkip && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSkip();
              }}
              style={{ letterSpacing: "1.5px", color: t.rankMuted, textDecoration: "underline", cursor: "pointer" }}
            >
              SKIP INTRO &rsaquo;
            </span>
          )}
        </Reveal>
        <div style={{ height: "1px", background: t.borderSubtle, margin: "14px 0 auto" }} />

        <div style={{ flex: 1 }} />
        {/* The parchment veil: translucent paper wash + feathered halo (the
            boxShadow) so it reads as a cleaner patch of the same page, not a
            card sitting on top of it. Docked to the bottom edge as a full
            width strip (rather than a centered card) so the art reads
            uninterrupted above it and the log sits like a caption. */}
        <div
          style={{
            alignSelf: "stretch",
            margin: "0 0 8px",
            width: "100%",
            textAlign: "center",
            background: "rgba(250,246,236,.72)",
            boxShadow: "0 0 16px 10px rgba(250,246,236,.6)",
            borderRadius: "8px",
            padding: "28px 38px",
            boxSizing: "border-box",
          }}
        >
          {screen.title && (
            <Reveal delay={150}>
              <div
                style={{
                  fontFamily: t.fontDisplay,
                  fontSize: "clamp(26px,3vw,34px)",
                  letterSpacing: "1px",
                  color: LORE_INK,
                  textShadow: "1.5px 1.5px 0 rgba(139,0,0,.25), 0 1px 0 rgba(255,255,255,.3)",
                  marginBottom: "24px",
                }}
              >
                {screen.title}
              </div>
            </Reveal>
          )}
          {screen.body.map((line, i) => (
            <Reveal key={i} delay={bodyDelay(i)}>
              <p
                style={{
                  margin: i === 0 ? 0 : "20px 0 0",
                  fontFamily: t.fontBody,
                  fontSize: "clamp(17px,2.1vw,21px)",
                  lineHeight: 1.85,
                  letterSpacing: ".2px",
                  color: LORE_INK,
                  textShadow: LORE_SHADOW,
                }}
              >
                {line}
              </p>
            </Reveal>
          ))}
        </div>

        <div style={{ height: "1px", background: t.borderSubtle, margin: "auto 0 20px" }} />
        <Reveal delay={continueDelay} style={{ textAlign: "center" }}>
          {/* Same parchment-wash treatment as the body veil, in miniature —
              without it this hint lands on the artwork's densest detail and
              disappears. */}
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              background: "rgba(250,246,236,.72)",
              boxShadow: "0 0 14px 10px rgba(250,246,236,.72)",
              borderRadius: "6px",
              fontSize: "12px",
              letterSpacing: "2px",
              color: t.rankMuted,
            }}
          >
            TAP TO CONTINUE &rsaquo;
          </div>
        </Reveal>
      </div>
    </div>
  );
}

// step < INTRO_SCREENS.length: atmosphere beats, tap to advance.
// step === INTRO_SCREENS.length: the route choice, the intro's last beat.
// The atmosphere beats play at the start of every run (SKIP INTRO on the
// lore page is the one shortcut past them); the route choice is never
// skipped — it's a real per-run decision, not lore.
//
// Every advance within the intro — including a skip jumping several steps —
// is one PageTransition dissolve: the old page fades over the next, whose
// staggered reveals carry the arrival. The first page after BEGIN doesn't
// dissolve (there's no page before it); it enters through its reveals.
export default function Intro({ step, onContinue, onSkip, onChooseRoute }) {
  const atRoute = step >= INTRO_SCREENS.length;
  let page;
  if (atRoute) {
    page = <RouteSelect onChooseRoute={onChooseRoute} />;
  } else {
    const screen = INTRO_SCREENS[step];
    page =
      screen.type === "image" ? (
        <LeavingHomeScreen screen={screen} onContinue={onContinue} />
      ) : (
        <AtmosphereScreen screen={screen} onContinue={onContinue} onSkip={onSkip} showSkip />
      );
  }
  return <PageTransition turnKey={atRoute ? INTRO_SCREENS.length : step}>{page}</PageTransition>;
}
