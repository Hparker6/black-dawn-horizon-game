import { useState } from "react";
import * as t from "../styles/tokens.js";
import { INTRO_SCREENS } from "../data/intro.js";
import RouteSelect from "./RouteSelect.jsx";

const LEAVE_MS = 500;

// A one-off cinematic beat, not a journal page — the artwork is the entire
// visual focus, so this deliberately shares none of AtmosphereScreen's
// chrome (no RECOVERED LOG header, no skip link, no ruled dividers). The
// panel it renders into is normally paper-colored (DangerAtmosphere.jsx);
// this fills that same flex slot with the app's own outer dark gradient
// instead, so for this one beat the "page" reads as a dark, cinematic frame
// rather than a page in the journal. Advances on click/tap anywhere, but
// not instantly — `leaving` plays a brief page-turn-out first (see
// bdhPageTurnOut in index.css) and onContinue only fires once it's done.
function LeavingHomeScreen({ screen, onContinue }) {
  const [leaving, setLeaving] = useState(false);

  const advance = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onContinue, LEAVE_MS);
  };

  return (
    <div
      onClick={advance}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") advance();
      }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "22px",
        padding: "24px",
        cursor: "pointer",
        background: t.bgGradient,
        transformOrigin: "right center",
        animation: leaving ? `bdhPageTurnOut ${LEAVE_MS}ms ease-in forwards` : "bdhOverlay .5s ease both",
      }}
    >
      {/* Sized to the image's own rendered box (inline-block shrink-wraps
          to it), so the text overlay below can anchor to the art's actual
          visible edges instead of guessing at letterboxed empty space. */}
      <div style={{ position: "relative", display: "inline-block", maxWidth: "94%" }}>
        <img
          src={screen.image}
          alt={screen.imageAlt}
          draggable={false}
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "72vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            boxShadow: "0 30px 70px -20px rgba(0,0,0,.75)",
            userSelect: "none",
          }}
        />
        <div style={{ position: "absolute", left: "6%", bottom: "9%", width: "clamp(280px,38vw,420px)", maxWidth: "82%" }}>
          {screen.journal.map((line, i) => (
            <p
              key={i}
              style={{
                margin: i === 0 ? 0 : "10px 0 0",
                fontFamily: t.fontHand,
                fontWeight: 500,
                fontSize: "clamp(16px,2.1vw,21px)",
                lineHeight: 1.6,
                color: "#f4efe4",
                textShadow: "0 2px 6px rgba(0,0,0,.85), 0 1px 12px rgba(0,0,0,.6)",
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
      <div style={{ fontSize: "11px", letterSpacing: "1px", color: "rgba(244,239,228,.5)" }}>Click anywhere to continue</div>
    </div>
  );
}

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

// step < INTRO_SCREENS.length: atmosphere beats, tap to advance.
// step === INTRO_SCREENS.length: the route choice, the intro's last beat.
// The atmosphere beats play at the start of every run (SKIP INTRO on the
// lore page is the one shortcut past them); the route choice is never
// skipped — it's a real per-run decision, not lore.
export default function Intro({ step, onContinue, onSkip, onChooseRoute }) {
  if (step < INTRO_SCREENS.length) {
    const screen = INTRO_SCREENS[step];
    if (screen.type === "image") {
      return <LeavingHomeScreen screen={screen} onContinue={onContinue} />;
    }
    return <AtmosphereScreen screen={screen} onContinue={onContinue} onSkip={onSkip} showSkip />;
  }
  return <RouteSelect onChooseRoute={onChooseRoute} />;
}
