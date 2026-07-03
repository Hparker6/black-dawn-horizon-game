// Generic flag plumbing, deliberately kept separate from event/choice logic
// so it's reusable for whatever gates on flags later (companions, secret
// endings, more callbacks) — not just this run's 3 demo chains. A flag is
// just a string; nothing here knows what any specific flag means.

export function hasAllFlags(flags, required) {
  if (!required || required.length === 0) return true;
  const set = flags instanceof Set ? flags : new Set(flags);
  return required.every((f) => set.has(f));
}

export function hasAnyFlag(flags, excluded) {
  if (!excluded || excluded.length === 0) return false;
  const set = flags instanceof Set ? flags : new Set(flags);
  return excluded.some((f) => set.has(f));
}

// True if a node (an event, a choice, an outcome — anything carrying
// requiresFlags/excludeFlags) is currently allowed given the run's flags.
export function flagsAllow(node, flags) {
  return hasAllFlags(flags, node.requiresFlags) && !hasAnyFlag(flags, node.excludeFlags);
}

export function addFlags(flags, newFlags) {
  if (!newFlags || newFlags.length === 0) return flags;
  return Array.from(new Set([...flags, ...newFlags]));
}
