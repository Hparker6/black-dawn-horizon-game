import { useEffect, useRef, useState } from "react";
import * as t from "../styles/tokens.js";
import { playPageWhoosh } from "../engine/sound.js";
import { prefersReducedMotion } from "../engine/motion.js";

export const PAGE_TURN_MS = 800;

// Turns one journal page into the next like a physical book instead of a
// hard screen swap. Usage: wrap whatever page is current and change
// `turnKey` when it should turn — the wrapper handles the rest:
//
//   <PageTurner turnKey={step}>{renderPage(step)}</PageTurner>
//
// How it works: when turnKey changes, the outgoing page is kept mounted
// (same React key, so its instance and completed entrance animations are
// preserved — it must not replay its own reveals mid-turn) and promoted to
// an absolutely-positioned overlay that hinges away from the left spine
// (bdhPageTurnAway) with a moving shade across its face. The incoming page
// mounts beneath it immediately — physically it was "already there under
// the sheet" — with a cast shadow that sweeps off as it's uncovered
// (bdhPageUncover), plus a 2.5% camera push on the whole book
// (bdhCameraPush) and a quiet procedural paper whoosh (engine/sound.js).
//
// Everything animates with CSS transforms/opacity only (compositor-
// friendly, no layout thrash), and the overlay is pointer-events: none so
// fast readers can keep tapping through mid-turn. Under
// prefers-reduced-motion the swap is instant and silent.
export default function PageTurner({ turnKey, sound = true, children }) {
  // { key, node }: the page being turned away, still mounted during the
  // animation. null when the book is at rest.
  const [leaving, setLeaving] = useState(null);
  const currentRef = useRef({ key: turnKey, node: children });
  const timerRef = useRef(null);

  // Keep the snapshot of the current page fresh on every render, so the
  // copy promoted to the overlay at turn time is the page as last rendered,
  // not as it looked when it first mounted.
  if (currentRef.current.key === turnKey) {
    currentRef.current = { key: turnKey, node: children };
  }

  useEffect(() => {
    if (currentRef.current.key === turnKey) return;
    const old = currentRef.current;
    currentRef.current = { key: turnKey, node: children };
    if (prefersReducedMotion()) {
      setLeaving(null);
      return;
    }
    if (sound) playPageWhoosh();
    setLeaving(old);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLeaving(null), PAGE_TURN_MS);
  }, [turnKey, children, sound]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        animation: leaving ? `bdhCameraPush ${PAGE_TURN_MS}ms ease-in-out both` : "none",
      }}
    >
      {leaving && (
        <div
          key={`page-${leaving.key}`}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "none",
            // Solid paper behind the lifting sheet: pages with transparent
            // backgrounds (the lore page) must read as opaque paper while
            // airborne, not a ghost of text.
            background: t.paper,
            transformOrigin: "left center",
            willChange: "transform",
            animation: `bdhPageTurnAway ${PAGE_TURN_MS}ms ease-in-out both`,
          }}
        >
          {leaving.node}
          {/* Shade sweeping across the lifting page's face as it tilts away
              from the light. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "linear-gradient(to right, rgba(0,0,0,.55), rgba(0,0,0,.12) 55%, transparent 85%)",
              animation: `bdhPageTurnShade ${PAGE_TURN_MS}ms ease-in-out both`,
            }}
          />
        </div>
      )}

      <div key={`page-${turnKey}`} style={{ flex: 1, position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
        {children}
        {leaving && (
          /* Shadow the airborne sheet casts on the page being revealed,
             sweeping off toward the spine as the sheet lifts. */
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              pointerEvents: "none",
              background: "linear-gradient(to right, rgba(20,10,4,.5), rgba(20,10,4,.18) 45%, transparent 78%)",
              animation: `bdhPageUncover ${PAGE_TURN_MS}ms ease-in-out both`,
            }}
          />
        )}
      </div>
    </div>
  );
}
