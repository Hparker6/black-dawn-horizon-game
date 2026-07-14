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

// Same axis, a coarser cut for the one-time closing reflection. Note the
// balanced tier is written as recognition — a player who made hard calls in
// both directions should read as someone who held a line, never as
// "forgettably average."
const ENDING_REFLECTIONS = {
  compassion:
    "You kept slowing down for people who had nothing to give you back. It never once made you safer. You did it anyway, every time it came up again.",
  balanced:
    "You gave when you could carry the cost and refused when it would have sunk you — and you were honest with yourself about which was which. That's not indifference. That's how a person stays a person out here.",
  survival:
    "Somewhere along the way you stopped asking whether someone deserved help before you decided against it. It kept you moving. You don't talk about the rest.",
};

// Short title form of the same cut — the "WHO YOU BECAME" line on the
// results cover page. Resolved through the same endingTier() as the prose
// reflection so the title and the paragraph beneath it can never disagree
// about who you were.
const IDENTITY_EPITHETS = {
  compassion: "The One Who Still Stopped",
  balanced: "The One Who Endured",
  survival: "The One Who Kept Walking",
};

// Endings whose unlock conditions ARE a moral verdict. Clean Hands is
// flag-proven conduct (helped the nursery kids, robbed no one) and its
// recap paragraph says so in as many words — if the reflection beneath it
// then called the run "balanced," the page would contradict itself. These
// leans outrank the number: the flags are ground truth, the axis is only
// an estimate built from however many tagged choices the run happened to
// surface.
const ENDING_MORAL_LEANS = {
  clean_hands: "compassion",
  path_remembered: "compassion",
  price_of_kindness: "compassion",
  blood_on_the_sand: "survival",
  paid_in_full: "survival",
};

// The closing cut. The numeric bar is deliberately low (±2, was ±3):
// impacts land in ±1 steps and most tagged choices are gated behind a
// specific companion/keepsake/trait the run may simply not have, so even a
// consistently kind run rarely banks more than a few points — at ±3,
// genuinely compassionate runs were falling through to "balanced."
function endingTier(profile, endingId) {
  const lean = endingId && ENDING_MORAL_LEANS[endingId];
  if (lean) return lean;
  const v = (profile && profile.compassion) || 0;
  if (v >= 2) return "compassion";
  if (v <= -2) return "survival";
  return "balanced";
}

export function getEndingReflection(profile, endingId) {
  return ENDING_REFLECTIONS[endingTier(profile, endingId)];
}

export function getIdentityEpithet(profile, endingId) {
  return IDENTITY_EPITHETS[endingTier(profile, endingId)];
}
