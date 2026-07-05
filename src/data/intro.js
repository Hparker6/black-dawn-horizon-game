// Short atmospheric beats shown once (per engine/save.js's seenIntro flag)
// before a run's first draft round. Each screen is one recovered-log entry
// — terse, present tense, second person — advanced only by a deliberate
// tap (see screens/Intro.jsx), same rule as everything else in this game.
// The route choice is the last beat, not part of this array, since it
// renders as two buttons instead of a tap-anywhere continue.
export const INTRO_SCREENS = [
  { body: ["Three weeks since the grid failed.", "The city didn't take it well."] },
  { body: ["They say the coast guard station still runs — lights, a working radio, maybe a way out.", "Maybe."] },
];

// The run-shaping choice that ends the intro. Picking either sets a single
// flag (route_highway / route_backroads) into the run's normal flags array
// — see engine/pacing.js's ROUTE_MODIFIERS for the actual mechanical effect
// (danger-event weighting + days-per-event), read by engine/events.js.
export const ROUTE_CHOICE = {
  body: ["Dawn breaks over the ruins.", "You've got what's on your back and a long way to go. Nobody is coming unless you reach them first."],
  options: [
    { flag: "route_highway", label: "Take the HIGHWAYS", detail: "Faster — but you'll be seen." },
    { flag: "route_backroads", label: "Keep to the BACKROADS", detail: "Slower — but quieter." },
  ],
};
