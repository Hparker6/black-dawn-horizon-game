import { useEffect, useRef, useState } from "react";
import * as t from "../styles/tokens.js";

// Ratio of hpMax below which danger cues start appearing — matches
// ConditionBar's own HURT threshold, so the atmosphere and the condition
// word agree on what counts as "hurt". Cues then scale from 0 (right at
// that threshold) to 1 (hp at 0).
const HURT_RATIO = 0.5;
const HEARTBEAT_CALM_MS = 2200;
const HEARTBEAT_CRITICAL_MS = 800;

function dangerLevel(hp, hpMax) {
  if (!hpMax) return 0;
  const hurtAt = hpMax * HURT_RATIO;
  if (hp >= hurtAt) return 0;
  return Math.max(0, Math.min(1, 1 - hp / hurtAt));
}

// One spiral ring of the journal's binding, tiled down the left edge below:
// a punched hole in the paper plus the wire looping out through it. Drawn
// as a data-URI so it can repeat-y like a texture instead of rendering a
// list of elements. Static, handcrafted, never animated.
const SPIRAL_RING_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='36'%3E%3Cellipse cx='13' cy='18' rx='9' ry='6' fill='none' stroke='%236f675a' stroke-width='2'/%3E%3Ccircle cx='19' cy='18' r='3.4' fill='%2314100c' fill-opacity='.5'/%3E%3C/svg%3E\")";

// Sprint 3: the panel is no longer an abstract paper rectangle — it's a
// physical field journal. Three quiet cues, all static: a spiral binding
// down the left edge (rings above, a shadowed gutter under them), a stack
// of pages peeking out beneath the bottom edge (layered hairline shadows),
// and a faint fiber texture across the paper itself. Content clears the
// binding via the inner wrapper's left padding.
const PAGE_STACK_SHADOW = "0 1px 0 #fbf7ee inset, 0 2px 0 #e6dcc6, 0 5px 0 #d9cdb2, 0 8px 0 #c9bc9e, 0 9px 14px -4px rgba(0,0,0,.5)";
const BINDING_WIDTH = 30;

// Wraps the journal panel so its own condition (hp/hpMax) drives tasteful
// tension cues that escalate with how close to death the run is: a
// darkening/desaturating filter, a pulsing ink-bleed vignette at the edges
// (the "heartbeat"), and a brief shake the instant a hit lands while
// already hurt. Everything clears automatically once hp climbs back above
// the hurt threshold, so healing reads as visible relief. Detects hp drops
// itself (prevHpRef) — same self-contained pattern as ConditionBar's flash
// detection — so no extra wiring is needed beyond passing hp/hpMax through.
export default function DangerAtmosphere({ hp, hpMax, reduceMotion, children }) {
  const level = dangerLevel(hp, hpMax);
  const prevHpRef = useRef(hp);
  // Alternates 'A'/'B' rather than reusing one name so the CSS animation
  // restarts on every hit even though this element never remounts (it
  // wraps the whole panel, which owns a lot of live screen state).
  const [shakeKind, setShakeKind] = useState(null);

  useEffect(() => {
    const prevHp = prevHpRef.current;
    prevHpRef.current = hp;
    const newLevel = dangerLevel(hp, hpMax);
    if (hp < prevHp && newLevel > 0 && !reduceMotion) {
      setShakeKind((k) => (k === "A" ? "B" : "A"));
    }
  }, [hp, hpMax, reduceMotion]);

  const heartbeatMs = HEARTBEAT_CALM_MS - level * (HEARTBEAT_CALM_MS - HEARTBEAT_CRITICAL_MS);

  return (
    <div style={{ width: "100%", animation: shakeKind ? `bdhJournalShake${shakeKind} .4s ease` : "none" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "min(88vh,940px)",
          background: t.paper,
          color: t.ink,
          borderRadius: "2px 3px 3px 2px",
          boxShadow: `${PAGE_STACK_SHADOW}, ${t.panelFrameGlow}`,
          backgroundImage: t.coffeeRingBg,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          filter: level > 0 ? `saturate(${(1 - level * 0.55).toFixed(2)}) brightness(${(1 - level * 0.16).toFixed(2)})` : "none",
          transition: "filter 1.1s ease",
        }}
      >
        {/* Paper fiber: the same fractal noise the app already uses, but
            confined to the page at whisper opacity so the cream reads as
            stock, not screen. Multiply keeps ink/type contrast intact. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            mixBlendMode: "multiply",
            opacity: 0.05,
            backgroundImage: t.noiseOverlayBg,
          }}
        />
        {/* Spiral binding: shadowed gutter + tiled wire rings down the left
            edge. Sits above the page texture but below the danger vignette. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: `${BINDING_WIDTH}px`,
            zIndex: 2,
            pointerEvents: "none",
            background: `linear-gradient(90deg, rgba(20,16,12,.10) 0, rgba(20,16,12,.045) 55%, transparent 100%)`,
            backgroundImage: `${SPIRAL_RING_BG}, linear-gradient(90deg, rgba(20,16,12,.10) 0, rgba(20,16,12,.045) 55%, transparent 100%)`,
            backgroundRepeat: "repeat-y, no-repeat",
            backgroundPosition: "0 10px, 0 0",
            backgroundSize: "30px 36px, 100% 100%",
          }}
        />
        {/* Content clears the binding so no text ever sits under the rings. */}
        <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", flex: 1, minHeight: 0, paddingLeft: `${BINDING_WIDTH}px` }}>
          {children}
        </div>
        {level > 0 && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              pointerEvents: "none",
              background: `radial-gradient(120% 120% at 50% 50%, transparent 46%, rgba(120,10,10,${(level * 0.48).toFixed(2)}) 100%)`,
              opacity: reduceMotion ? 1 : undefined,
              animation: reduceMotion ? "none" : `bdhHeartbeat ${heartbeatMs}ms ease-in-out infinite`,
              transition: "background 1.1s ease",
            }}
          />
        )}
      </div>
    </div>
  );
}
