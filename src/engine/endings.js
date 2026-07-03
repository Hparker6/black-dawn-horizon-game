import { flagsAllow } from "./flags.js";

// Secret endings only ever override a WIN outcome (reached the coast alive)
// — dying always keeps its own ending (the generic recap, or a named death
// ending like "Lost on the Sand"). `secretEndings` is checked in array
// order, so priority is just "put the more specific condition first" in
// the data (see data/endings.js: ENDINGS / SECRET_ENDINGS) — the caller
// doesn't need any special-case logic here to prefer one over another.
export function resolveSecretEnding(secretEndings, { died, flags }) {
  if (died) return null;
  for (const se of secretEndings) {
    if (flagsAllow(se, flags)) return se;
  }
  return null;
}
