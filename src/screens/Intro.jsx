import * as t from "../styles/tokens.js";
import { INTRO_SCREENS, ROUTE_CHOICE } from "../data/intro.js";

// A recovered-log page: same hairline-divider/centered-block composition as
// Title.jsx, so the intro reads as part of the same journal rather than a
// separate splash. Tap-anywhere-to-continue (plus an explicit affordance,
// same "and/or" pattern as EventReaction's outcome cards) — no timer, ever.
function AtmosphereScreen({ screen, onContinue, onSkip, showSkip }) {
  return (
    <div
      onClick={onContinue}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onContinue();
      }}
      style={{ flex: 1, display: "flex", flexDirection: "column", padding: "44px 30px 34px", cursor: "pointer", animation: "bdhFadeUp .5s ease both" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", letterSpacing: "3px", color: t.muted }}>
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
      </div>
      <div style={{ height: "1px", background: t.borderSubtle, margin: "14px 0 auto" }} />
      <div style={{ textAlign: "center", margin: "auto 0", maxWidth: "440px", alignSelf: "center" }}>
        {screen.body.map((line, i) => (
          <p key={i} style={{ fontFamily: t.fontDisplay, fontSize: "24px", color: t.ink, lineHeight: 1.3, letterSpacing: ".5px", margin: i === 0 ? 0 : "14px 0 0" }}>
            {line}
          </p>
        ))}
      </div>
      <div style={{ height: "1px", background: t.borderSubtle, margin: "auto 0 18px" }} />
      <div style={{ textAlign: "center", fontSize: "11px", letterSpacing: "2px", color: t.rankMuted }}>TAP TO CONTINUE &rsaquo;</div>
    </div>
  );
}

function RouteChoiceScreen({ onChooseRoute }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "44px 30px 34px", animation: "bdhFadeUp .5s ease both" }}>
      <div style={{ fontSize: "11px", letterSpacing: "3px", color: t.muted, textAlign: "center" }}>RECOVERED LOG</div>
      <div style={{ height: "1px", background: t.borderSubtle, margin: "14px 0 auto" }} />
      <div style={{ textAlign: "center", margin: "auto 0", maxWidth: "440px", alignSelf: "center" }}>
        {ROUTE_CHOICE.body.map((line, i) => (
          <p key={i} style={{ fontFamily: t.fontDisplay, fontSize: "22px", color: t.ink, lineHeight: 1.3, letterSpacing: ".5px", margin: i === 0 ? 0 : "12px 0 0" }}>
            {line}
          </p>
        ))}
      </div>
      <div style={{ height: "1px", background: t.borderSubtle, margin: "auto 0 20px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {ROUTE_CHOICE.options.map((opt) => (
          <button
            key={opt.flag}
            onClick={() => onChooseRoute(opt.flag)}
            className="bdh-press"
            style={{
              width: "100%",
              textAlign: "left",
              border: `1px solid ${t.ink}`,
              cursor: "pointer",
              background: t.paper,
              boxShadow: "0 2px 0 #1a1a1a",
              borderRadius: "2px",
              padding: "14px 16px",
              fontFamily: t.fontBody,
            }}
          >
            <div style={{ fontSize: "15px", color: t.ink, letterSpacing: ".3px" }}>&rsaquo; {opt.label}</div>
            <div style={{ fontSize: "12px", color: t.muted, fontStyle: "italic", marginTop: "4px" }}>{opt.detail}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// step < INTRO_SCREENS.length: atmosphere beats, tap to advance.
// step === INTRO_SCREENS.length: the route choice, the intro's last beat.
// seenIntro-and-not-skipped players land straight on step===INTRO_SCREENS.length
// (see App.jsx's onPlay) so they never re-read the atmosphere text, but the
// choice itself is never skipped — it's a real per-run decision, not lore.
export default function Intro({ step, onContinue, onSkip, onChooseRoute }) {
  if (step < INTRO_SCREENS.length) {
    return <AtmosphereScreen screen={INTRO_SCREENS[step]} onContinue={onContinue} onSkip={onSkip} showSkip />;
  }
  return <RouteChoiceScreen onChooseRoute={onChooseRoute} />;
}
