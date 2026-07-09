import { useEffect, useRef, useState } from "react";
import * as t from "../styles/tokens.js";
import { playPageWhoosh } from "../engine/sound.js";
import { prefersReducedMotion } from "../engine/motion.js";

export const PAGE_FADE_MS = 500;

// Dissolves one journal page into the next — a quiet film cut, not a stage
// trick. Usage: wrap whatever page is current and change `turnKey` when it
// should advance:
//
//   <PageTransition turnKey={step}>{renderPage(step)}</PageTransition>
//
// When turnKey changes, the outgoing page is kept mounted (same React key,
// so its instance and completed entrance animations are preserved — it must
// not replay its own reveals while dissolving) and promoted to an
// absolutely-positioned overlay that fades out over the incoming page,
// which mounts beneath it immediately and fades in over the SAME duration
// (bdhPageFadeIn) — a true crossfade, not a fade-out-then-reveal. Without
// this, the outgoing page finished dissolving (500ms) well before the
// incoming page's own staggered reveals/artwork had fully arrived (up to
// ~1050ms for a page with background art), leaving a gap of bare paper
// that read as a flash between pages. A quiet procedural paper rustle
// (engine/sound.js) carries the physicality the visuals deliberately
// underplay.
//
// Opacity-only (compositor-friendly), overlay is pointer-events: none so
// fast readers can keep tapping through mid-fade, and under
// prefers-reduced-motion both fades are skipped — the swap is instant and
// silent.
export default function PageTransition({ turnKey, sound = true, children }) {
  // { key, node }: the page dissolving out, still mounted during the fade.
  // null when at rest.
  const [leaving, setLeaving] = useState(null);
  const currentRef = useRef({ key: turnKey, node: children });
  const timerRef = useRef(null);

  // Whether the incoming page (the one about to render below) should play
  // its fade-in: true for every turnKey change except the very first render
  // (nothing to crossfade from yet) and except under reduced motion. Stored
  // keyed by turnKey (not a plain boolean) so the decision, once made for a
  // given page, holds steady across every re-render of that same page —
  // e.g. the re-render the `leaving` effect below triggers a moment later.
  // Computed synchronously during render rather than from `leaving` state
  // itself, which only updates via that effect and would still read stale
  // on the very render where turnKey first changes — reading it here would
  // make the fade-in miss its own first frame (a pop-then-fade glitch
  // instead of a clean crossfade).
  const animateInRef = useRef({ key: turnKey, animate: false });
  if (animateInRef.current.key !== turnKey) {
    animateInRef.current = { key: turnKey, animate: !prefersReducedMotion() };
  }
  const animateIn = animateInRef.current.animate;

  // Keep the snapshot of the current page fresh on every render, so the
  // copy promoted to the overlay at transition time is the page as last
  // rendered, not as it looked when it first mounted.
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
    timerRef.current = setTimeout(() => setLeaving(null), PAGE_FADE_MS);
  }, [turnKey, children, sound]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
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
            // Solid paper behind the dissolving sheet: pages with
            // transparent backgrounds (the lore page) must fade out as
            // opaque paper, not as a ghost of text over the next page.
            background: t.paper,
            animation: `bdhPageDissolve ${PAGE_FADE_MS}ms ease-in-out both`,
          }}
        >
          {leaving.node}
        </div>
      )}

      <div
        key={`page-${turnKey}`}
        style={{
          flex: 1,
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          animation: animateIn ? `bdhPageFadeIn ${PAGE_FADE_MS}ms ease-in-out both` : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
