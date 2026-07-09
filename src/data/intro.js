// Short atmospheric beats shown at the start of every run, before the route
// choice. Each screen is one recovered-log entry — terse, present tense,
// second person — advanced only by a deliberate tap (see screens/Intro.jsx),
// same rule as everything else in this game. The route choice is the last
// beat, not part of this array, since it renders as two buttons instead of
// a tap-anywhere continue.
//
// Exactly two beats, by design: outbreak lore, then the leaving-home
// cinematic — so BEGIN -> lore -> image -> route choice is three pages
// total. The lore beat carries both the outbreak (what happened) and the
// coast-guard rumor (why you're driving toward the coast), which used to be
// two separate text pages.
//
// `type` picks which screen component renders it (Intro.jsx): 'text'
// (default, omitted on the lore entry) gets the shared journal-page chrome
// (RECOVERED LOG header, skip link, ruled dividers). 'image' is a one-off
// full-bleed cinematic beat — its own component, no shared chrome at all —
// so it can't accidentally inherit paper-page styling meant for plain text
// beats.
export const INTRO_SCREENS = [
  {
    title: "THE OUTBREAK",
    // Full-page background artwork (the fallen city) rendered behind the
    // log text by AtmosphereScreen — dimmed, desaturated, and feathered
    // into the paper at the edges so the words stay the focus and the art
    // reads as part of the same recovered page, not a backdrop swap.
    art: "/outbreak-city.jpg",
    body: [
      "Three weeks since the outbreak.",
      "The grid failed. The cities fell.",
      "The dead didn't stay dead.",
      "They say the coast guard station still runs — lights, a working radio, maybe a way out.",
      "Maybe.",
    ],
  },
  {
    type: "image",
    title: "Leaving Home",
    image: "/leaving-home.jpg",
    imageAlt: "A farmhouse at dusk seen from a loaded pickup truck's tailgate, fires burning on the horizon down the road ahead.",
    journal: ["I waited longer than I should have.", "There's nothing left here now.", "If the coast is still standing...", "it's my last chance."],
  },
];

// The run-shaping choice that ends the intro — rendered by screens/
// RouteSelect.jsx over the route-select.jpg notebook artwork, not as plain
// text buttons. `flag` is the one field that's load-bearing: it must match
// engine/pacing.js's ROUTE_MODIFIERS keys exactly (route_highway /
// route_backroads), since that's what actually shapes danger weighting and
// days-per-event once the run starts. Everything else here is presentation
// copy only.
export const ROUTE_CHOICE = {
  options: [
    {
      flag: "route_highway",
      title: "HIGHWAYS",
      tagline: "Fast • Dangerous • Direct",
      intro: "The interstate is the quickest route toward the coast.",
      fragments: ["Military convoys.", "Gridlocked cities.", "Thousands fled this way."],
      stat: "Shorter Journey • Higher Danger",
      button: "Take the Highway →",
      journalLine: "If there's still a way out... it'll be on the interstate.",
    },
    {
      flag: "route_backroads",
      title: "BACKROADS",
      tagline: "Slow • Quiet • Uncertain",
      intro: "County roads pass forgotten towns and abandoned farms.",
      fragments: ["Less traffic.", "More time.", "Fewer guarantees."],
      stat: "Longer Journey • Lower Early Danger",
      button: "Take the Backroads →",
      journalLine: "Maybe the small towns lasted longer.",
    },
  ],
};
