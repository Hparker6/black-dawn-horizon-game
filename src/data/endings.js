// The source has no standalone "endings" array — win/death endings are inline on
// the final EVENTS entry ("The Signal") as `ending` / `deathEnding` strings, and
// `died && day<8` produces the ad-hoc "Rookie" tier outside the table below.
// This file holds the day-threshold tier ladder that DCLogic's tierFor() used,
// kept verbatim so engine/scoring.js can reference named breakpoints instead of
// magic numbers.
// maxDays is the exclusive upper bound, mirroring the original's `d<12`/`d<22`/`d<34`
// (so 21 days is still "Survivor", not "Veteran" — the boundary itself matters).
export const TIERS = [
  { id: "drifter", label: "Drifter", maxDays: 12 },
  { id: "survivor", label: "Survivor", maxDays: 22 },
  { id: "veteran", label: "Veteran", maxDays: 34 },
  { id: "legend", label: "Legend", maxDays: Infinity },
];

export const ROOKIE_TIER = { id: "rookie", label: "Rookie" };
export const ROOKIE_DEATH_DAY_CUTOFF = 8;
