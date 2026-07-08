// Central prefers-reduced-motion check, read at animation time (not module
// load) so an OS-level toggle mid-session is respected without a reload.
// Anything that plays a purely decorative animation or sound should gate on
// this; layout/opacity end-states must be identical either way.
export function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
