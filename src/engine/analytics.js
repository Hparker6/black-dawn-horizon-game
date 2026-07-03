// Thin wrapper around gtag so call sites stay declarative and nothing throws
// if the tag hasn't loaded (ad blockers, slow network, gtag stripped in a
// fork, etc). Fires as a GA4 event; params show up as that event's
// dimensions/metrics in GA4's Explore reports.
export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
