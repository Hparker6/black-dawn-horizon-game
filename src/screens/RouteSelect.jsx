import { useState } from "react";
import * as t from "../styles/tokens.js";
import { ROUTE_CHOICE } from "../data/intro.js";

// Timing for the multi-phase selection sequence (spec-given): a beat after
// clicking before the journal line appears, how long that line holds, then
// how long the whole screen takes to dissolve before the existing route
// logic (onChooseRoute) actually fires and swaps to the draft screen.
const SELECT_DELAY_MS = 600;
const JOURNAL_HOLD_MS = 1500;
const DISSOLVE_MS = 550;

// Measured against the source art (public/route-select.jpg) the same way
// NotebookHome's strip zones were: percentages of the notebook image's own
// box, not the viewport. Each card covers its illustration plus the blank
// cream page beneath it (the whole thing is the click target); TEXT_ZONE is
// the narrower band within that where the blank paper actually is — content
// is confined there so nothing sits on top of the artwork itself.
const CARDS = {
  route_highway: { left: 6, top: 19, width: 44, height: 74 },
  route_backroads: { left: 50, top: 19, width: 44, height: 74 },
};
// Measured against the art's actual pixel luminance (row std-dev — busy
// illustration/ink reads high, blank paper reads ~0), card-relative (card
// spans image y 19-93%, i.e. 74% tall, so image-space measurements are
// divided by that 74 and re-based off the card's own top).
//
// The blank strip is NOT uniformly blank corner-to-corner: the frame's
// decorative corner flourishes curl in from both bottom corners and occupy
// roughly the bottom third of the strip near the edges, even though the
// same y-range is empty in the middle of the page — a left-aligned button
// there was landing right on top of the left flourish. Content is centered
// (see textAlign/alignItems below) specifically so it stays clear of both
// corners rather than trying to dodge just one.
const TEXT_ZONE = { top: 81.5, bottom: 1.5 };

function zoneToCard(z) {
  return { position: "absolute", left: `${z.left}%`, top: `${z.top}%`, width: `${z.width}%`, height: `${z.height}%` };
}

function RouteCard({ opt, phase, selectedFlag, onSelect }) {
  const disabled = phase !== "idle";
  const isSelected = selectedFlag === opt.flag;
  const faded = disabled && !isSelected;

  return (
    <button
      className="bdh-route-card"
      style={{
        ...zoneToCard(CARDS[opt.flag]),
        border: "none",
        background: "transparent",
        padding: 0,
        margin: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: faded ? 0.32 : 1,
        transition: "opacity .4s ease",
      }}
      disabled={disabled}
      onClick={() => onSelect(opt.flag)}
      aria-label={`${opt.title}: ${opt.tagline}`}
    >
      <div
        style={{
          position: "absolute",
          left: "9%",
          right: "9%",
          top: `${TEXT_ZONE.top}%`,
          bottom: `${TEXT_ZONE.bottom}%`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "1.1%",
          overflow: "hidden",
        }}
      >
        <div style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: "clamp(12px,1.6vw,17px)", letterSpacing: "2px", color: "#1a1208" }}>{opt.title}</div>
        <div style={{ fontFamily: t.fontHand, fontWeight: 600, fontSize: "clamp(11px,1.3vw,14px)", color: "#3a2e1c" }}>{opt.tagline}</div>
        <div style={{ fontFamily: t.fontHand, fontSize: "clamp(10px,1.15vw,13px)", lineHeight: 1.2, color: "#2a2013" }}>{opt.intro}</div>
        <div style={{ fontFamily: t.fontHand, fontSize: "clamp(10px,1.15vw,13px)", lineHeight: 1.2, color: "#2a2013" }}>
          {opt.fragments.join("  ")}
        </div>
        <div style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: "clamp(9px,1vw,12px)", letterSpacing: "1px", color: t.goldDark }}>{opt.stat}</div>
        <div
          style={{
            fontFamily: t.fontBody,
            fontSize: "clamp(10px,1.15vw,13px)",
            letterSpacing: ".5px",
            color: "#1a1208",
            borderBottom: "1px solid rgba(26,18,8,.5)",
            paddingBottom: "1px",
          }}
        >
          {opt.button}
        </div>
      </div>
    </button>
  );
}

export default function RouteSelect({ onChooseRoute }) {
  const [phase, setPhase] = useState("idle"); // idle -> chosen -> journal -> leaving
  const [selectedFlag, setSelectedFlag] = useState(null);

  const handleSelect = (flag) => {
    if (phase !== "idle") return;
    setSelectedFlag(flag);
    setPhase("chosen");
    setTimeout(() => {
      setPhase("journal");
      setTimeout(() => {
        setPhase("leaving");
        setTimeout(() => onChooseRoute(flag), DISSOLVE_MS);
      }, JOURNAL_HOLD_MS);
    }, SELECT_DELAY_MS);
  };

  const selectedOpt = ROUTE_CHOICE.options.find((o) => o.flag === selectedFlag);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        // A dark wood-desk surface (no literal texture asset — the art
        // itself has none baked in) so the notebook reads as a physical
        // object someone set down and opened, not a UI panel. Grain reuses
        // the app's existing noise token rather than a new asset.
        background: "radial-gradient(120% 100% at 50% 20%, #241a10 0%, #17110a 55%, #0c0805 100%)",
        backgroundImage: `radial-gradient(120% 100% at 50% 20%, #241a10 0%, #17110a 55%, #0c0805 100%), ${t.noiseOverlayBg}`,
        backgroundBlendMode: "normal, overlay",
        opacity: phase === "leaving" ? 0 : 1,
        transition: `opacity ${DISSOLVE_MS}ms ease`,
      }}
    >
      <div style={{ position: "relative", display: "inline-block", maxWidth: "96%" }}>
        <img
          src="/route-select.jpg"
          alt="An open spiral notebook. The left page shows a gridlocked highway choked with traffic and smoke; the right page shows a quiet backroad past a church and an old gas station."
          draggable={false}
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "82vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            boxShadow: "0 50px 90px -25px rgba(0,0,0,.85), 0 18px 34px -14px rgba(0,0,0,.6)",
            userSelect: "none",
          }}
        />

        {ROUTE_CHOICE.options.map((opt) => (
          <RouteCard key={opt.flag} opt={opt} phase={phase} selectedFlag={selectedFlag} onSelect={handleSelect} />
        ))}

        {(phase === "journal" || phase === "leaving") && selectedOpt && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "3%",
              transform: "translateX(-50%)",
              width: "min(70%, 480px)",
              textAlign: "center",
              fontFamily: t.fontHand,
              fontWeight: 600,
              fontSize: "clamp(14px,1.9vw,19px)",
              color: "#1a1208",
              textShadow: "0 1px 0 rgba(255,255,255,.3)",
              animation: "bdhFadeUp .4s ease both",
              pointerEvents: "none",
            }}
          >
            {selectedOpt.journalLine}
          </div>
        )}
      </div>
    </div>
  );
}
