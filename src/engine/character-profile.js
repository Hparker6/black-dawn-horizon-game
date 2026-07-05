// Hidden character reflection system (v1 slice). Tracks one invisible axis —
// compassion vs. survival — built from choices tagged with `characterImpact`
// in data/events.js (see the comment there), and turns the accumulated value
// into a handful of quiet mid-run journal asides plus a closing reflection
// appended after the ending recap in Results.jsx. This module owns the axis
// and its prose; it knows nothing about events, flags, or endings beyond the
// one number it's handed.
//
// Nothing here is ever rendered as a score, meter, or label — the only
// output is plain text meant to blend into the game's existing journal
// voice. If a player notices this system exists, it's because the writing
// changed between two runs, not because anything told them so.

export function createProfile() {
  return { compassion: 0 };
}

export function applyChoiceImpact(profile, characterImpact) {
  const delta = characterImpact && characterImpact.compassion;
  if (!delta) return profile;
  return { ...profile, compassion: profile.compassion + delta };
}

// Each tier fires once per run, the first time the axis crosses it — not on
// a timer or a dice roll — so a reflection reads as the game recognizing a
// pattern that actually solidified, rather than firing on a schedule.
// `shownTierKeys` (kept in run state, reset each run) is what makes that
// "once" hold; the underlying number can keep climbing well past a tier
// without it firing again.
const MID_RUN_TIERS = [
  { key: "survival_1", test: (v) => v <= -2, line: "Helping strangers no longer feels automatic." },
  { key: "survival_2", test: (v) => v <= -4, line: "You're beginning to measure every conversation by what it might cost." },
  { key: "survival_3", test: (v) => v <= -6, line: "You don't remember the last time you trusted anyone." },
  { key: "compassion_1", test: (v) => v >= 2, line: "You still catch yourself slowing down when someone calls for help." },
  { key: "compassion_2", test: (v) => v >= 4, line: "You keep giving away what you can't really spare." },
  { key: "compassion_3", test: (v) => v >= 6, line: "It stopped being a choice somewhere back there. You just help." },
];

export function checkMidRunReflection(profile, shownTierKeys) {
  const shown = shownTierKeys || [];
  for (const t of MID_RUN_TIERS) {
    if (shown.includes(t.key)) continue;
    if (t.test(profile.compassion)) return { key: t.key, text: t.line };
  }
  return null;
}

// Same axis, a coarser cut for the one-time closing reflection — wide enough
// that a run without a strong lean reads as "balanced" rather than tipping
// on a single stray choice.
const ENDING_REFLECTIONS = {
  compassion:
    "You kept slowing down for people who had nothing to give you back. It never once made you safer. You did it anyway, every time it came up again.",
  balanced:
    "You helped when it cost little and hardened when it cost more. Most people do. The road never asked you to be anything else, and you never gave it a reason to notice you.",
  survival:
    "Somewhere along the way you stopped asking whether someone deserved help before you decided against it. It kept you moving. You don't talk about the rest.",
};

export function getEndingReflection(profile) {
  const v = (profile && profile.compassion) || 0;
  if (v >= 3) return ENDING_REFLECTIONS.compassion;
  if (v <= -3) return ENDING_REFLECTIONS.survival;
  return ENDING_REFLECTIONS.balanced;
}
