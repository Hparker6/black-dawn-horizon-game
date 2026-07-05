// Single tunable knob for a run's emotional shape: calm start -> rising
// danger -> tense climax, with relief beats. Retune the numbers below to
// reshape pacing without touching the sampler in engine/events.js.
//
// `phases` slices a run (by fraction of its planned non-final length, 0..1)
// into weighted mixes of event `type`. `through` is the fraction of the run
// where that phase ends — phases must be listed in ascending `through`
// order and the last must be 1. `weights` are relative (they don't need to
// sum to 100); a 0 or omitted type just won't be drawn that phase.
export const PACING = {
  phases: [
    { through: 0.20, weights: { quiet: 35, discovery: 35, danger: 30 } }, // Phase A: calm start
    { through: 0.50, weights: { discovery: 50, danger: 50 } },            // Phase B: rising danger
    { through: 0.80, weights: { quiet: 30, danger: 70 } },                // Phase C: mostly danger
    { through: 1.00, weights: { discovery: 10, danger: 90 } },            // Phase D: climax runway
  ],

  // Climax-tagged events are reserved for the back half of a run. Rather
  // than give `climax` its own line in every phase above, this carves out a
  // share of that phase's `danger` weight and redirects it to `climax` —
  // 0 in phases A/B keeps climax beats from firing early.
  climaxShareOfDanger: [0, 0, 0.3, 0.6],

  // Relief valve: after a choice that lands significant condition damage or
  // fails a check, the very next draw uses this weight table instead of the
  // phase curve — a forced breather so tension has rhythm, not a flat climb.
  reliefValve: {
    damageThreshold: -3, // a health delta <= this counts as "significant"
    weights: { quiet: 60, discovery: 40 },
  },

  // If the weighted-picked type has no eligible events left, fall back to
  // the next-nearest type in tone rather than erroring or repeating.
  fallbackOrder: {
    quiet: ['discovery', 'danger', 'climax'],
    discovery: ['quiet', 'danger', 'climax'],
    danger: ['climax', 'discovery', 'quiet'],
    climax: ['danger', 'discovery', 'quiet'],
  },
};

function phaseFor(progress) {
  for (const phase of PACING.phases) {
    if (progress <= phase.through) return phase;
  }
  return PACING.phases[PACING.phases.length - 1];
}

function weightedPick(weights) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const [type, w] of entries) {
    roll -= w;
    if (roll < 0) return type;
  }
  return entries[entries.length - 1][0];
}

// Picks the event `type` to draw next given how far into the run we are
// (`progress`, 0..1 across the planned non-final event count), whether the
// last event was a significant setback (see isSignificantSetback), and a
// route-driven danger multiplier (see ROUTE_MODIFIERS below) — the relief
// valve overrides the phase curve for exactly one draw regardless of route.
export function pickEventType(progress, reliefBias, dangerWeightMultiplier = 1) {
  if (reliefBias) return weightedPick(PACING.reliefValve.weights) || 'quiet';
  const phase = phaseFor(progress);
  const idx = PACING.phases.indexOf(phase);
  const climaxShare = PACING.climaxShareOfDanger[idx] || 0;
  const weights = { ...phase.weights };
  if (weights.danger) weights.danger *= dangerWeightMultiplier;
  if (climaxShare > 0 && weights.danger > 0) {
    const toClimax = weights.danger * climaxShare;
    weights.danger -= toClimax;
    weights.climax = (weights.climax || 0) + toClimax;
  }
  return weightedPick(weights) || 'danger';
}

// The intro's route choice (see data/intro.js) — one flag, stored in the
// run's normal flags array like any other narrative flag, read here rather
// than threaded as a separate parameter so the two call sites that need it
// (pickNextEvent's type weighting, applyResult's day math) don't need their
// own signatures touched.
//
// Widened after the first pass read as imperceptible: three levers now
// compound instead of one modest one — a much bigger danger-weight swing,
// a much bigger days-per-event swing, AND the run's planned event COUNT
// itself shifts (see eventCountDelta, applied to MIN/MAX_RUN_EVENTS in
// App.jsx) — so highway is a shorter run with more teeth in it, backroads a
// longer run with fewer, and the two outcome distributions actually pull
// apart instead of overlapping into the same ~20-something-day average.
export const ROUTE_MODIFIERS = {
  route_highway: { label: 'THE HIGHWAYS', dangerWeightMultiplier: 1.9, daysPerEventMultiplier: 0.7, eventCountDelta: -2 },
  route_backroads: { label: 'THE BACKROADS', dangerWeightMultiplier: 0.4, daysPerEventMultiplier: 1.2, eventCountDelta: 1 },
};

export function routeFromFlags(flags) {
  if (!flags) return null;
  if (flags.includes('route_highway')) return 'route_highway';
  if (flags.includes('route_backroads')) return 'route_backroads';
  return null;
}

export function routeModifier(route) {
  return ROUTE_MODIFIERS[route] || { label: null, dangerWeightMultiplier: 1, daysPerEventMultiplier: 1, eventCountDelta: 0 };
}

// Occasional in-fiction callouts so the route choice is FELT mid-run, not
// just measured in hidden math. Only surfaces when the route's whole
// premise is thematically live for the event on screen — highway lines on
// a danger/climax beat ("yeah, this is what exposure costs"), backroads
// lines on a quiet/discovery beat ("yeah, this is what the extra time
// buys") — so it always reads as commentary on what's actually happening,
// never a random aside. Even then it's not constant (see routeFlavorFor's
// showChance) so it stays a beat, not a tagline repeated every screen.
const ROUTE_FLAVOR = {
  route_highway: {
    danger: [
      "The highway leaves you exposed — trouble comes quick.",
      "Open road, open sightlines. Someone was bound to notice.",
      "Fast roads don't stay quiet for long.",
    ],
    climax: [
      "This is what the highway was always going to cost.",
      "No cover out here. There never was.",
    ],
  },
  route_backroads: {
    quiet: [
      "The backroads are slow, but the quiet holds.",
      "Nobody finds you out here. That's the idea.",
    ],
    discovery: [
      "Slow going, but nothing's found you yet.",
      "The long way round still gets you there — and gets you here first.",
    ],
  },
};

// Small stable string hash (djb2-ish) — used instead of Math.random() so the
// same event always shows the same flavor line (or none) across re-renders,
// rather than flickering between choices while it's on screen.
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ~40% of thematically-matching events show a line — frequent enough to
// register as "the route keeps mattering," rare enough not to feel like a
// repeating tagline under every danger event on a highway run.
const ROUTE_FLAVOR_SHOW_RATE = 0.4;

export function routeFlavorFor(route, eventType, eventId) {
  const pool = ROUTE_FLAVOR[route] && ROUTE_FLAVOR[route][eventType];
  if (!pool || pool.length === 0) return null;
  const hash = hashString(`${route}:${eventId}`);
  if (hash % 100 >= ROUTE_FLAVOR_SHOW_RATE * 100) return null;
  return pool[hash % pool.length];
}

// A choice outcome counts as a "significant setback" — and triggers the
// relief valve on the next draw — if it failed a dice check outright, or
// (whether checked or not) hit condition for more than the threshold.
export function isSignificantSetback({ health, success }) {
  if (success === false) return true;
  return (health || 0) <= PACING.reliefValve.damageThreshold;
}

// How many non-final events must remain before a run counts as "almost
// there" — shared by ProgressTrail's close-range styling and the
// destination ETA below, so both switch to their near-the-coast framing at
// the same point instead of drifting out of sync.
export const NEAR_END_EVENTS_LEFT = 2;

// Flat fallback for the ETA math below, used only before a run has any
// resolved events to average from (i.e. on the very first event, when
// day is still 0). Chosen to land in the same ballpark as a typical run's
// actual average (~2-2.5 days/event, per data/events.js).
const DEFAULT_DAYS_PER_EVENT = 2.5;

// Atmospheric "how far to rescue" readout — approximate and self-correcting,
// not a hard timer (individual events cost anywhere from 1-5 days). Projects
// the average day-cost of events already resolved this run across however
// many non-final events remain before the final event, so it counts down as
// the run advances rather than sitting static. Once the run is in its last
// stretch (see NEAR_END_EVENTS_LEFT), ProgressTrail's own "THE COAST IS
// NEAR" already carries that message, so this returns no label rather than
// a redundant one.
export function destinationEta({ day, eventIndex, runEventsTarget }) {
  const eventsRemaining = Math.max(0, runEventsTarget - eventIndex);
  const near = eventsRemaining <= NEAR_END_EVENTS_LEFT;
  if (near) return { near, label: null };
  const avgDaysPerEvent = eventIndex > 0 ? day / eventIndex : DEFAULT_DAYS_PER_EVENT;
  const daysLeft = Math.max(1, Math.round(eventsRemaining * avgDaysPerEvent));
  return { near, label: `RESCUE BROADCAST: ~${daysLeft} DAY${daysLeft === 1 ? "" : "S"} OUT` };
}
