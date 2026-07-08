import { prefersReducedMotion } from "../engine/motion.js";

// Staggered fade-up wrapper for cinematic page entrances: each block on a
// page gets its own <Reveal delay={...}> so title, artwork, body, and the
// continue affordance arrive in sequence instead of popping in as one unit.
// `both` fill-mode keeps content invisible until its delay elapses, but
// never blocks interaction — the page underneath stays clickable throughout,
// so an impatient tap always works.
//
// Under prefers-reduced-motion everything renders immediately with no
// animation at all (not a faster fade — none).
export default function Reveal({ delay = 0, duration = 600, style, children }) {
  const animation = prefersReducedMotion() ? "none" : `bdhFadeUp ${duration}ms ease both`;
  return <div style={{ animation, animationDelay: `${delay}ms`, ...style }}>{children}</div>;
}
