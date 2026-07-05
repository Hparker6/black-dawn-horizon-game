import { flagsAllow } from "./flags.js";

// Secret endings can override EITHER outcome now: a survival secret (the
// original 3 — reach the coast having earned/spent a specific reputation)
// or a death secret (themed deaths tied to a choice made earlier in the
// run, wherever the run actually ends). Each entry in `secretEndings`
// declares which outcome it's for via `died` (true/false, defaults to
// false), so a death can never accidentally match a survival-only entry or
// vice versa — the two only ever compete against others of their own kind.
//
// `dayMin`/`dayMax` are optional extra gates alongside requiresFlags/
// excludeFlags, for conditions that aren't flag-shaped (an unusually long
// survival, for instance) — same "just another thing this entry can gate
// on" spirit as flags, not a second mechanism.
//
// `secretEndings` is checked in array order, so priority is just "put the
// more specific condition first" in the data (see data/endings.js:
// ENDINGS / SECRET_ENDINGS) — the caller doesn't need any special-case
// logic here to prefer one over another.
export function resolveSecretEnding(secretEndings, { died, day, flags }) {
  for (const se of secretEndings) {
    if (!!se.died !== !!died) continue;
    if (se.dayMin != null && day < se.dayMin) continue;
    if (se.dayMax != null && day > se.dayMax) continue;
    if (!flagsAllow(se, flags)) continue;
    return se;
  }
  return null;
}
