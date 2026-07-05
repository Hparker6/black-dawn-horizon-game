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
// guess. Keyed by the ending's stable `id` (matches ENDINGS below) — NOT
// its display `label` — so renaming an ending's label for flavor can never
// silently disconnect it from its recap. Each entry owns `died` (must
// match the run's actual died state — Results.jsx checks this before using
// the recap, so a data mistake here fails safe onto the generic recap
// instead of contradicting the outcome) and `recap(item, days)`, which
// stays coherent with that specific ending rather than being stapled
// together from whatever the last event happened to say. `item` is the
// top carried loadout item's name (or a died/survived appropriate
// fallback word), `days` is the run length.
export const ENDING_RECAPS = {
  military_rescue: {
    died: false,
    recap: (item, days) =>
      `You walked out of the dead city with ${item} and a plan half-formed. The radio finally answered — real, human, alive — and the helicopter found you before the horizon did. ${days} days after it started, someone came.`,
  },
  signal_fire_rescue: {
    died: false,
    recap: (item, days) =>
      `You walked out of the dead city with ${item} and a plan half-formed. The fire you built on the bluff was the last thing you had left to try, and it was enough — the searchlight found you and held. ${days} days after it started, they saw you.`,
  },
  ran_the_gauntlet: {
    died: false,
    recap: (item, days) =>
      `You walked out of the dead city with ${item} and a plan half-formed. The beach was longer than it looked and full of things that wanted you dead, but you crossed it on your own two feet and reached the pad standing. ${days} days after it started, that was enough.`,
  },
  barely_made_it: {
    died: false,
    recap: (item, days) =>
      `You left the city with ${item} and the will to see the coast. The beach very nearly kept you — you crossed it bleeding, half-carried by momentum, and went down on the pad still breathing. ${days} days after it started, breathing was the whole victory.`,
  },
  lost_on_the_sand: {
    died: true,
    recap: (item, days) =>
      `You left the city with ${item} and the will to see the coast. The beach was longer and fuller than it looked, and this time it didn't let go. You went down in sight of the pad, close enough to see the lights. ${days} days — the black dawn kept you, right at the end.`,
  },
};

export const GENERIC_DEATH_RECAP = (item, days) =>
  `You left the city with ${item} and the will to see the coast. You didn't get there. Something out there was faster, hungrier, or just luckier than you were, and the black dawn kept you before the horizon could. ${days} days — more than most, but not enough.`;

export const GENERIC_SURVIVAL_RECAP = (item, days) =>
  `You walked out of the dead city with ${item} and a plan half-formed. ${days} days later, the horizon finally gave something back.`;

ENDING_RECAPS["path_remembered"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. Because you paid the toll instead of forcing it, split the find instead of taking it, and left food on a windowsill instead of walking past, the road kept giving back exactly when you needed it to. ${days} days after it started, the horizon opened for you like it remembered.`,
};
ENDING_RECAPS["blood_on_the_sand"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. You took what you needed at the bridge, and again at the pharmacy, and told yourself both times it was the only way through. Maybe it was. ${days} days after it started, you reached the coast — you just don't wear the same face you left with.`,
};
ENDING_RECAPS["clean_hands"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. You helped when it would have been easier not to, and every hand you could have forced open, you didn't. ${days} days after it started, you reached the coast the same person who left the city — which, out here, is its own kind of miracle.`,
};

// Sprint 2 endings pass — five more secrets, covering the shapes the first
// three didn't: an unusually long survival, both route choices from the
// intro, and — new territory for this file — themed DEATHS instead of only
// themed survivals. Each recap explicitly names the choice(s) that earned
// it, per the same rule as the three above: the player should be able to
// trace the ending back to a decision, not just read it as flavor text.
ENDING_RECAPS["endless_road"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. ${days} days is not a number most people reach — you outlasted the calendar itself, one more morning and then another, long after the horizon should have given up on you. Nobody survives that long by accident.`,
};
ENDING_RECAPS["ghost_of_the_highway"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. You took the highways the whole way — the fast roads, the seen roads — betting speed against every set of eyes between you and the coast. Because you never once slowed down for the backroads, ${days} days after it started you outran the horizon instead of outlasting it.`,
};
ENDING_RECAPS["the_long_road_home"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. You kept to the backroads the whole way — the slow roads, the quiet ones — trading time for the chance that nothing would ever see you coming. Because you never once risked the highway, ${days} days after it started you arrived a little late, and a lot more careful.`,
};
ENDING_RECAPS["paid_in_full"] = {
  died: true,
  recap: (item, days) =>
    `You left the city with ${item} and the will to see the coast. You took the toll bridge by force, and the pharmacy split by force, and told yourself both times the road owed you that much. It didn't. Because you took twice and gave back nothing, the black dawn collected what you owed ${days} days in — the road remembers, even when it doesn't say so out loud.`,
};
ENDING_RECAPS["price_of_kindness"] = {
  died: true,
  recap: (item, days) =>
    `You left the city with ${item} and the will to see the coast. You gave what you could spare when you didn't have to — to strangers, to kids behind a locked door, to anyone who asked. Because you never once took more than you gave, ${days} days in, the road took the one thing it never gives back. It wasn't fair. None of this ever was.`,
};

// The full ending collection — everything a run can end on, named and
// trackable, whether the player discovered it by dice roll (the base 5,
// always eligible) or by earning it through flags/day (the secrets). One
// source of truth for three consumers: the results screen (via
// ENDING_RECAPS above, keyed by `label`), the secret-ending resolver in
// engine/endings.js (SECRET_ENDINGS, filtered below), and the Endings
// Collection screen (the full list, "?????" for undiscovered secrets).
//
// Secret endings apply on top of whichever outcome actually ended the run —
// a survival win (`died` omitted/false below) or a death (`died: true`),
// anywhere in the run, not just at the final event — see engine/endings.js
// and engine/events.js's applyResult. `died` keeps the two pools from ever
// competing with each other; order only matters *within* a pool, since
// that's the priority when a run's flags/day could satisfy more than one.
// Broad rule of thumb applied below: rarer/more-specific conditions first
// (an unusually long survival, then a 3-flag combo, then 2-flag, then
// 1-flag+excludes), with the single-flag route endings last since picking
// a route is the easiest condition here to satisfy — everyone picks one.
export const ENDINGS = [
  { id: "military_rescue", label: "Military Rescue", secret: false, desc: "Call in a rescue with the right gear already in hand." },
  { id: "signal_fire_rescue", label: "Signal Fire Rescue", secret: false, desc: "Light the bluff and let the searchlight find you." },
  { id: "ran_the_gauntlet", label: "Ran the Gauntlet", secret: false, desc: "Beat the beach on nothing but combat." },
  { id: "barely_made_it", label: "Barely Made It", secret: false, desc: "Survive the dash for the pad, just barely." },
  { id: "lost_on_the_sand", label: "Lost on the Sand", secret: false, desc: "Fail the dash for the pad and go down in sight of it." },
  {
    id: "endless_road",
    label: "The One Who Wouldn't Stop",
    secret: true,
    died: false,
    dayMin: 40,
    desc: "Survive a run far longer than anyone has a right to.",
  },
  {
    id: "path_remembered",
    label: "The Path Remembered",
    secret: true,
    died: false,
    requiresFlags: ["paid_toll", "spared_scavenger", "helped_nursery_kids"],
    desc: "Reach the coast having earned trust at every turn.",
  },
  {
    id: "blood_on_the_sand",
    label: "Blood on the Sand",
    secret: true,
    died: false,
    requiresFlags: ["robbed_toll", "robbed_scavenger"],
    desc: "Reach the coast having taken what you needed, twice over.",
  },
  {
    id: "clean_hands",
    label: "Clean Hands",
    secret: true,
    died: false,
    // Requires proof of active mercy (helped_nursery_kids), not just the
    // absence of the two robbed_* flags on its own — a run that simply
    // never drew the toll bridge or rival scavenger events would otherwise
    // qualify by default, which made "secret" the common case instead of
    // an earned one.
    requiresFlags: ["helped_nursery_kids"],
    excludeFlags: ["robbed_toll", "robbed_scavenger"],
    desc: "Reach the coast having helped when it cost you nothing to walk past, and taken nothing you didn't earn.",
  },
  {
    id: "ghost_of_the_highway",
    label: "Ghost of the Highway",
    secret: true,
    died: false,
    requiresFlags: ["route_highway"],
    desc: "Take the fast, exposed roads the whole way — and still make it.",
  },
  {
    id: "the_long_road_home",
    label: "The Long Road Home",
    secret: true,
    died: false,
    requiresFlags: ["route_backroads"],
    desc: "Keep to the quiet backroads the whole way — patience over speed.",
  },
  {
    id: "paid_in_full",
    label: "Paid in Full",
    secret: true,
    died: true,
    requiresFlags: ["robbed_toll", "robbed_scavenger"],
    desc: "Take what you needed, twice over — and never reach the coast.",
  },
  {
    id: "price_of_kindness",
    label: "The Price of Kindness",
    secret: true,
    died: true,
    // Mirrors Clean Hands' exclusion so the two death-side secrets stay as
    // cleanly separated as their survival-side counterparts: a run that
    // was both ruthless and once-kind reads as Paid in Full, not this.
    requiresFlags: ["helped_nursery_kids"],
    excludeFlags: ["robbed_toll", "robbed_scavenger"],
    desc: "Help when it costs you, right up until it costs you everything.",
  },
];

export const SECRET_ENDINGS = ENDINGS.filter((e) => e.secret);

// The one place an ending id gets turned into its display label — for
// share text and analytics params, which want a human-readable string, not
// the id. Everything that drives actual logic (achievements, the endings
// collection, recap lookup) reads the id directly and never needs this.
export function endingLabel(id) {
  const e = ENDINGS.find((x) => x.id === id);
  return e ? e.label : null;
}
