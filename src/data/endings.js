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

// Recap text, one per named ending, so the results screen never has to
// guess. Each entry owns `died` (must match the run's actual died state —
// Results.jsx checks this before using the recap, so a data mistake here
// fails safe onto the generic recap instead of contradicting the outcome)
// and `recap(item, days)`, which stays coherent with that specific ending
// rather than being stapled together from whatever the last event happened
// to say. `item` is the top carried loadout item's name (or a died/survived
// appropriate fallback word), `days` is the run length.
export const ENDING_RECAPS = {
  "Military Rescue": {
    died: false,
    recap: (item, days) =>
      `You walked out of the dead city with ${item} and a plan half-formed. The radio finally answered — real, human, alive — and the helicopter found you before the horizon did. ${days} days after it started, someone came.`,
  },
  "Signal Fire Rescue": {
    died: false,
    recap: (item, days) =>
      `You walked out of the dead city with ${item} and a plan half-formed. The fire you built on the bluff was the last thing you had left to try, and it was enough — the searchlight found you and held. ${days} days after it started, they saw you.`,
  },
  "Ran the Gauntlet": {
    died: false,
    recap: (item, days) =>
      `You walked out of the dead city with ${item} and a plan half-formed. The beach was longer than it looked and full of things that wanted you dead, but you crossed it on your own two feet and reached the pad standing. ${days} days after it started, that was enough.`,
  },
  "Barely Made It": {
    died: false,
    recap: (item, days) =>
      `You left the city with ${item} and the will to see the coast. The beach very nearly kept you — you crossed it bleeding, half-carried by momentum, and went down on the pad still breathing. ${days} days after it started, breathing was the whole victory.`,
  },
  "Lost on the Sand": {
    died: true,
    recap: (item, days) =>
      `You left the city with ${item} and the will to see the coast. The beach was longer and fuller than it looked, and this time it didn't let go. You went down in sight of the pad, close enough to see the lights. ${days} days — the black dawn kept you, right at the end.`,
  },
};

export const GENERIC_DEATH_RECAP = (item, days) =>
  `You left the city with ${item} and the will to see the coast. You didn't get there. Something out there was faster, hungrier, or just luckier than you were, and the black dawn kept you before the horizon could. ${days} days — more than most, but not enough.`;

export const GENERIC_SURVIVAL_RECAP = (item, days) =>
  `You walked out of the dead city with ${item} and a plan half-formed. ${days} days later, the horizon finally gave something back.`;

ENDING_RECAPS["The Path Remembered"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. Because you paid the toll instead of forcing it, split the find instead of taking it, and left food on a windowsill instead of walking past, the road kept giving back exactly when you needed it to. ${days} days after it started, the horizon opened for you like it remembered.`,
};
ENDING_RECAPS["Blood on the Sand"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. You took what you needed at the bridge, and again at the pharmacy, and told yourself both times it was the only way through. Maybe it was. ${days} days after it started, you reached the coast — you just don't wear the same face you left with.`,
};
ENDING_RECAPS["Clean Hands"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. You helped when it would have been easier not to, and every hand you could have forced open, you didn't. ${days} days after it started, you reached the coast the same person who left the city — which, out here, is its own kind of miracle.`,
};

// The full ending collection — everything a run can end on, named and
// trackable, whether the player discovered it by dice roll (the base 5,
// always eligible) or by earning it through flags (the 3 secrets). One
// source of truth for three consumers: the results screen (via
// ENDING_RECAPS above, keyed by `label`), the secret-ending resolver in
// engine/endings.js (SECRET_ENDINGS, filtered below), and the Endings
// Collection screen (the full list, "?????" for undiscovered secrets).
//
// Secret endings only ever apply on top of a WIN (reached the coast alive)
// — see engine/endings.js. Order matters: it's the priority order when a
// run's flags could satisfy more than one (e.g. "The Path Remembered"
// implies "Clean Hands" is also technically true — no robbed_* flags — so
// the more specific one must be checked first).
export const ENDINGS = [
  { id: "military_rescue", label: "Military Rescue", secret: false, desc: "Call in a rescue with the right gear already in hand." },
  { id: "signal_fire_rescue", label: "Signal Fire Rescue", secret: false, desc: "Light the bluff and let the searchlight find you." },
  { id: "ran_the_gauntlet", label: "Ran the Gauntlet", secret: false, desc: "Beat the beach on nothing but combat." },
  { id: "barely_made_it", label: "Barely Made It", secret: false, desc: "Survive the dash for the pad, just barely." },
  { id: "lost_on_the_sand", label: "Lost on the Sand", secret: false, desc: "Fail the dash for the pad and go down in sight of it." },
  {
    id: "path_remembered",
    label: "The Path Remembered",
    secret: true,
    requiresFlags: ["paid_toll", "spared_scavenger", "helped_nursery_kids"],
    desc: "Reach the coast having earned trust at every turn.",
  },
  {
    id: "blood_on_the_sand",
    label: "Blood on the Sand",
    secret: true,
    requiresFlags: ["robbed_toll", "robbed_scavenger"],
    desc: "Reach the coast having taken what you needed, twice over.",
  },
  {
    id: "clean_hands",
    label: "Clean Hands",
    secret: true,
    // Requires proof of active mercy (helped_nursery_kids), not just the
    // absence of the two robbed_* flags on its own — a run that simply
    // never drew the toll bridge or rival scavenger events would otherwise
    // qualify by default, which made "secret" the common case instead of
    // an earned one.
    requiresFlags: ["helped_nursery_kids"],
    excludeFlags: ["robbed_toll", "robbed_scavenger"],
    desc: "Reach the coast having helped when it cost you nothing to walk past, and taken nothing you didn't earn.",
  },
];

export const SECRET_ENDINGS = ENDINGS.filter((e) => e.secret);
