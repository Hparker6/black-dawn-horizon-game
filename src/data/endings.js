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
// Survivor Identity pass — keepsake-driven secrets. Each keys off the
// keepsake's draft flag (keepsake_<id>, stamped by App.jsx) PLUS the flag
// its rare event/dialogue sets, so carrying the object alone never
// qualifies — the player has to have actually let it speak mid-run. The
// one exception is the tags: their whole meaning is what happens when you
// fall, so death while carrying them is the condition itself.
ENDING_RECAPS["vow_kept"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. At the overlook you carved both your initials into the rail one more time, and after that the road never really had you — you were already spoken for. ${days} days after it started, you reached the coast still wearing the ring, still meaning it.`,
};
ENDING_RECAPS["one_more_song"] = {
  died: false,
  recap: (item, days) =>
    `You walked out of the dead city with ${item} and a plan half-formed. Somewhere back there you played the tape out loud — side A, third song — and gave the old world one more chance to sing before the end. ${days} days after it started, you reached the coast humming it.`,
};
ENDING_RECAPS["name_remembered"] = {
  died: true,
  recap: (item, days) =>
    `You left the city with ${item} and the will to see the coast. ${days} days in, the black dawn kept you — but you carried the tags the whole way, and whoever finds you will find a name, a chain, and proof you were somebody. They'll say it out loud once, properly. It's not rescue. It's not nothing, either.`,
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
    id: "vow_kept",
    label: "The Vow Kept",
    secret: true,
    died: false,
    // Both flags: the keepsake itself (stamped at the draft) and the
    // overlook's carving — carrying the ring without ever stopping for it
    // doesn't earn this.
    requiresFlags: ["keepsake_wedding_ring", "carved_initials"],
    desc: "Reach the coast still carrying the promise you made.",
  },
  {
    id: "one_more_song",
    label: "One More Song",
    secret: true,
    died: false,
    requiresFlags: ["keepsake_cassette_tape", "played_the_tape"],
    desc: "Reach the coast having given the old world one more chance to sing.",
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
  // Both route endings carry a day gate on top of the route flag. Without
  // one they matched EVERY survival (every run picks a route at the intro),
  // which silently made the five base endings unreachable — no run could
  // ever end on Military Rescue, and the "Answered" medal was dead. The
  // gates encode what each ending's own text already claims: the ghost
  // OUTRAN the horizon (an unusually fast highway run), the long road
  // ARRIVED LATE (an unusually patient backroads run). Anything in between
  // falls through to whichever base ending the final event actually earned.
  {
    id: "ghost_of_the_highway",
    label: "Ghost of the Highway",
    secret: true,
    died: false,
    requiresFlags: ["route_highway"],
    dayMax: 17,
    desc: "Take the fast, exposed roads the whole way — and outrun the horizon.",
  },
  {
    id: "the_long_road_home",
    label: "The Long Road Home",
    secret: true,
    died: false,
    requiresFlags: ["route_backroads"],
    dayMin: 34,
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
  {
    id: "name_remembered",
    label: "A Name to Send Home",
    secret: true,
    died: true,
    // Deliberately LAST in the death pool: any death while carrying the
    // tags qualifies, so the two choice-earned death secrets above must get
    // first claim — this is the fallback meaning of the tags, not an
    // override of what the run's choices earned.
    requiresFlags: ["keepsake_military_tags"],
    desc: "Fall on the road — but fall as somebody, with a name they can send home.",
  },
];

export const SECRET_ENDINGS = ENDINGS.filter((e) => e.secret);

// Sprint 3: every ending owns a hand-inked closing plate — the journal's
// last illustration. Same sparse stroke vocabulary as the survivor sketches
// and the intro plate (drawn into a stroked <g>, viewBox 0 0 160 90), keyed
// by the stable ending id. Two generics cover the unnamed outcomes.
export const ENDING_ART = {
  military_rescue: `
    <path d="M8 72 H152"/><path d="M20 76 q6 -3 12 0 M60 78 q6 -3 12 0 M116 76 q6 -3 12 0" stroke-opacity=".5"/>
    <path d="M62 38 q0 -8 12 -8 h14 q10 0 10 8 q0 8 -12 8 h-14 q-10 0 -10 -8 Z"/>
    <path d="M98 36 L124 30 L112 40"/><path d="M74 22 H106"/><path d="M90 22 V30"/><path d="M60 22 l6 2 M120 20 l-6 3" stroke-opacity=".5"/>
    <path d="M70 52 v6 M96 52 v6 M64 58 H102"/><path d="M84 58 V70" stroke-dasharray="2 4"/>`,
  signal_fire_rescue: `
    <path d="M10 74 C40 68 70 70 92 74 H152"/>
    <path d="M58 72 l7 -14 5 8 5 -11 5 17"/><path d="M50 74 l36 0 M55 68 l26 8" stroke-opacity=".8"/>
    <path d="M72 48 C68 40 78 36 74 28" stroke-opacity=".45"/>
    <path d="M148 8 L84 58 M152 20 L92 62" stroke-opacity=".55"/>`,
  ran_the_gauntlet: `
    <path d="M8 70 H152"/>
    <circle cx="126" cy="60" r="16"/><path d="M120 54 v12 M132 54 v12 M120 60 h12"/>
    <path d="M62 44 l8 8 M70 52 l-2 10 M70 52 l10 -2 M62 44 l-2 -8 M60 36 a4 4 0 1 0 .1 0"/>
    <path d="M52 58 l-8 6 M66 62 l4 10"/>
    <path d="M18 74 h3 M30 72 h3 M42 75 h3" stroke-opacity=".5"/>`,
  barely_made_it: `
    <path d="M8 74 H152"/>
    <circle cx="80" cy="62" r="20"/><path d="M72 54 v16 M88 54 v16 M72 62 h16"/>
    <path d="M114 60 a5 5 0 1 0 .1 0 M116 70 l-2 -6 M112 74 l2 -10 M110 68 l10 -2"/>
    <path d="M40 24 h18 M96 20 h20 M56 32 h14" stroke-opacity=".4"/>`,
  lost_on_the_sand: `
    <path d="M8 72 H152"/>
    <path d="M56 72 L60 56 L84 52 L88 68 Z" /><path d="M62 58 q10 -8 20 -2" stroke-opacity=".7"/>
    <path d="M60 72 l-6 6 M86 70 l6 6" stroke-opacity=".5"/>
    <path d="M100 30 q5 -7 10 0 q5 -7 10 0 M118 20 q4 -5 8 0" stroke-opacity=".7"/>
    <circle cx="140" cy="66" r="3" stroke-opacity=".55"/>`,
  endless_road: `
    <path d="M8 56 H152"/>
    <path d="M52 88 L76 56 M116 88 L86 56"/><path d="M84 86 L81 56" stroke-dasharray="3 5"/>
    <path d="M64 56 A16 16 0 0 1 96 56"/>
    <path d="M24 56 v-10 M20 48 h8 M136 56 v-8 M132 50 h8" stroke-opacity=".6"/>`,
  path_remembered: `
    <path d="M20 84 C60 74 50 58 84 50 C110 44 118 34 138 30" stroke-dasharray="4 6"/>
    <path d="M40 78 h10 M43 74 h5 M44 70 h3"/>
    <path d="M96 48 h10 M99 44 h5 M100 40 h3"/>
    <path d="M130 12 a7 7 0 1 0 .1 0" stroke-opacity=".6"/>`,
  blood_on_the_sand: `
    <path d="M8 74 H152" stroke-opacity=".6"/>
    <path d="M62 52 a10 12 0 1 0 .1 0"/><path d="M56 42 v-9 M62 40 v-11 M68 41 v-10 M73 44 v-8 M52 46 l-6 -6"/>
    <path d="M96 64 L124 52 M122 50 l6 -2 -2 6" />
    <circle cx="84" cy="70" r="1.6"/><circle cx="92" cy="74" r="1.2"/>`,
  vow_kept: `
    <path d="M8 72 H152" stroke-opacity=".5"/>
    <circle cx="68" cy="42" r="17"/><circle cx="92" cy="42" r="17"/>
    <path d="M68 25 l-5 -6 5 -5 5 5 Z"/>
    <path d="M28 76 q6 -3 12 0 M120 76 q6 -3 12 0" stroke-opacity=".45"/>`,
  one_more_song: `
    <rect x="34" y="52" width="52" height="30" rx="3"/><circle cx="50" cy="66" r="5"/><circle cx="70" cy="66" r="5"/><path d="M55 66 h10"/>
    <path d="M86 60 C104 54 100 38 116 32 C126 28 128 22 134 18" stroke-opacity=".7"/>
    <path d="M120 24 q4 -6 8 0 q4 -6 8 0" stroke-opacity=".8"/>`,
  clean_hands: `
    <path d="M50 62 C48 46 58 44 60 52 M60 50 C60 38 68 38 68 48 M68 46 C68 36 76 36 76 46 M76 46 C76 38 84 38 82 50 C82 62 74 70 62 70 C54 70 50 66 50 62 Z"/>
    <path d="M110 62 C112 46 102 44 100 52 M100 50 C100 38 92 38 92 48" stroke-opacity=".55"/>
    <path d="M66 24 v-6 M78 26 l4 -5 M54 26 l-4 -5" stroke-opacity=".5"/>`,
  ghost_of_the_highway: `
    <path d="M8 66 H152"/><path d="M36 88 L64 66 M124 88 L96 66"/><path d="M82 86 L80 66" stroke-dasharray="3 5"/>
    <path d="M78 40 a5 5 0 1 0 .1 0 M80 46 v12 M80 50 l-7 4 M80 50 l7 2 M80 58 l-6 8 M80 58 l6 8" stroke-dasharray="3 3" stroke-opacity=".8"/>
    <path d="M46 36 h14 M100 32 h16" stroke-opacity=".4"/>`,
  the_long_road_home: `
    <path d="M8 62 C40 58 70 60 152 54" stroke-opacity=".7"/>
    <path d="M20 86 C50 76 60 72 84 66 C104 62 118 60 134 58" stroke-dasharray="4 6"/>
    <path d="M108 54 V40 L122 32 L136 40 V54 Z M116 54 v-8 h12 v8" />
    <path d="M28 66 v-8 M40 64 v-8 M28 60 h12" stroke-opacity=".6"/>`,
  paid_in_full: `
    <path d="M8 76 H152" stroke-opacity=".6"/>
    <path d="M32 76 V40 M128 76 V40"/>
    <path d="M32 46 q16 10 30 12 M128 46 q-16 10 -30 12" />
    <path d="M68 62 a3 3 0 1 0 .1 0 M92 62 a3 3 0 1 0 .1 0" stroke-opacity=".8"/>
    <path d="M76 70 l2 6 M84 68 l-1 7" stroke-opacity=".55"/>`,
  price_of_kindness: `
    <path d="M40 20 H120 M40 20 V70 M120 20 V70 M36 70 H124 M80 20 V70 M40 45 H120" stroke-opacity=".7"/>
    <path d="M60 70 v-10 h14 v10"/><path d="M67 60 V48"/><path d="M67 48 q-8 -2 -8 -10 q8 0 8 10 q0 -10 8 -10 q0 8 -8 10" />
    <path d="M96 66 v-8 M92 58 h8" stroke-opacity=".6"/>`,
  name_remembered: `
    <path d="M8 76 H152" stroke-opacity=".6"/>
    <path d="M60 76 q20 -10 40 0" stroke-opacity=".7"/>
    <path d="M80 70 V26"/><path d="M74 26 h12 M80 20 a4 4 0 1 0 .1 0" stroke-opacity=".8"/>
    <path d="M80 34 C88 38 90 44 88 50"/><rect x="84" y="48" width="9" height="14" rx="3" transform="rotate(8 88 55)"/>`,
};

export const GENERIC_DEATH_ART = `
  <path d="M8 72 H152" stroke-opacity=".6"/>
  <path d="M70 72 q10 -6 20 0" stroke-opacity=".7"/>
  <path d="M80 66 V34 M70 42 H90"/>
  <path d="M116 24 q5 -7 10 0" stroke-opacity=".5"/>`;

export const GENERIC_SURVIVAL_ART = `
  <path d="M8 64 H152"/>
  <path d="M60 64 A20 20 0 0 1 100 64"/>
  <path d="M80 34 v-8 M58 40 l-6 -6 M102 40 l6 -6 M48 56 l-8 -3 M112 56 l8 -3" stroke-opacity=".6"/>
  <path d="M24 74 q6 -3 12 0 M124 74 q6 -3 12 0" stroke-opacity=".5"/>`;

// The one lookup Results/EndingsCollection need: art for a named ending,
// falling back to the generic plate matching the outcome.
export function endingArt(endingId, died) {
  return ENDING_ART[endingId] || (died ? GENERIC_DEATH_ART : GENERIC_SURVIVAL_ART);
}

// The one place an ending id gets turned into its display label — for
// share text and analytics params, which want a human-readable string, not
// the id. Everything that drives actual logic (achievements, the endings
// collection, recap lookup) reads the id directly and never needs this.
export function endingLabel(id) {
  const e = ENDINGS.find((x) => x.id === id);
  return e ? e.label : null;
}
