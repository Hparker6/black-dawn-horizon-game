// Sprint 1: the Survivor Identity System. The old "5 random items" draft is
// replaced by three deliberate picks — one WEAPON, one COMPANION, one
// KEEPSAKE — and none of them carries a single stat point. Identity here is
// expressed only two ways:
//
//   `traits`  — the same capability strings the event data already gates on
//               (requiredTrait: 'Ranged'/'Heal'/'PryOpen'/...), so every
//               pre-existing trait-gated choice keeps working, it just
//               sources its unlock from WHO you are instead of WHAT you
//               rolled. Traits are capabilities, never numbers.
//
//   the pick itself — App.jsx records it in `identity` and stamps a flag
//               (`weapon_<id>` / `companion_<id>` / `keepsake_<id>`) into the
//               run's normal flag list, which is what lets choices gate on
//               requiredWeapon/requiredCompanion/requiredKeepsake (see
//               classifyChoices in engine/events.js), lets rare keepsake
//               events gate on requiresFlags, and lets secret endings key
//               off a keepsake without any new plumbing.
//
// `art` is inline SVG markup (paths only, stroke inherited from the <g>
// wrapper in Draft.jsx) — hand-drawn field-journal sketches, not emoji, so
// the draft pages read as pages from the same notebook as everything else.
// All strings are static/local; nothing user-supplied ever lands in them.
//
// `image` (optional) is an illustrated plate in public/art/ — ink-on-parchment
// artwork rendered in place of the SVG sketch when present. The SVG stays as
// the fallback if the image fails to load, so a card is never blank.

export const WEAPONS = [
  { id: 'crossbow', rarity: 'jackpot', name: 'The Crossbow', line: 'Quiet leaves no witnesses.', traits: ['Ranged'], image: '/art/crossbow.jpg',
    art: `<path d="M12 22 Q32 4 52 22"/><path d="M12 22 L52 22"/><path d="M32 8 L32 52"/><path d="M27 48 L32 42 L37 48"/><path d="M27 52 L37 52"/>` },
  { id: 'revolver', rarity: 'rare', name: 'The Revolver', line: 'Six answers. Choose the questions.', traits: ['Ranged'], image: '/art/revolver.jpg',
    art: `<path d="M10 22 H54 V28 H36"/><circle cx="28" cy="28" r="6"/><path d="M23 32 L15 48 L23 51 L29 36"/><path d="M31 34 q1 6 8 6"/><path d="M10 22 V27"/>` },
  { id: 'crowbar', rarity: 'common', name: 'The Crowbar', line: 'Every door becomes a suggestion.', traits: ['PryOpen'], image: '/art/crowbar.jpg',
    art: `<path d="M22 54 L46 18 C51 10 42 5 38 12 L36 16"/><path d="M17 49 L27 58"/>` },
  { id: 'hatchet', rarity: 'common', name: 'The Hatchet', line: "Fences, firewood, whatever's next.", traits: ['Fire'], image: '/art/hatchet.jpg',
    art: `<path d="M40 14 L20 56"/><path d="M35 7 L52 15 C50 26 41 29 33 24 Z"/>` },
  { id: 'rifle', rarity: 'ultra', name: 'The Hunting Rifle', line: 'One shot, from a long way off.', traits: ['Ranged'], image: '/art/rifle.jpg',
    art: `<path d="M6 34 L40 30"/><path d="M40 28 L56 32 L52 44 L44 38 L41 34"/><path d="M20 33 L22 41"/><rect x="25" y="21" width="12" height="5" rx="2"/><path d="M31 26 L31 30"/>` },
  { id: 'shotgun', rarity: 'common', name: 'The Shotgun', line: 'The sound alone ends arguments.', traits: [], image: '/art/shotgun.jpg',
    art: `<path d="M6 30 H38"/><path d="M6 34 H38"/><path d="M16 34 L14 41 H26 L26 34"/><path d="M38 28 L56 34 L52 45 L40 36 Z"/>` },
  { id: 'spear', rarity: 'common', name: 'The Spear', line: 'Reach, silence, and steady hands.', traits: [], image: '/art/spear.jpg',
    art: `<path d="M14 58 L44 18"/><path d="M44 18 L42 6 L54 12 Z"/><path d="M37 25 L43 30"/><path d="M34 29 L40 34"/>` },
  { id: 'machete', rarity: 'common', name: 'The Machete', line: 'Never jams. Never empty.', traits: [], image: '/art/machete.jpg',
    art: `<path d="M15 44 C28 46 42 38 52 22 L44 14 C36 28 26 35 17 35 Z"/><path d="M9 53 L16 43"/>` },
];

export const COMPANIONS = [
  { id: 'mechanic', rarity: 'common', name: 'The Mechanic', line: "If it's broken, she's interested.", traits: ['Signal', 'Purify'],
    art: `<circle cx="24" cy="22" r="8"/><circle cx="24" cy="22" r="2.5"/><path d="M24 11 V6 M24 33 V38 M13 22 H8 M35 22 H40 M16 14 L13 11 M32 30 L35 33 M32 14 L35 11 M16 30 L13 33"/><path d="M38 36 L52 50 M45 43 l7 -7"/>` },
  { id: 'nurse', rarity: 'rare', name: 'The Nurse', line: 'Every life still counts. Yours too.', traits: ['Heal', 'Cure'],
    art: `<circle cx="32" cy="32" r="18"/><path d="M32 21 V43 M21 32 H43"/>` },
  { id: 'hunter', rarity: 'common', name: 'The Hunter', line: 'Reads the ground like a headline.', traits: ['Scout'],
    art: `<path d="M32 56 V32"/><path d="M32 36 C24 34 20 27 20 15 M25 27 L18 25 M23 21 L16 21"/><path d="M32 36 C40 34 44 27 44 15 M39 27 L46 25 M41 21 L48 21"/>` },
  { id: 'officer', rarity: 'common', name: 'The Retired Officer', line: 'Twenty years of talking people down.', traits: ['Navigate'],
    art: `<path d="M32 8 L50 14 V30 C50 44 42 52 32 56 C22 52 14 44 14 30 V14 Z"/><path d="M32 22 l5 10 h-10 Z"/><path d="M24 42 H40"/>` },
  { id: 'seal', rarity: 'ultra', name: 'The Navy SEAL', line: 'The beach is just another Tuesday.', traits: [],
    art: `<path d="M32 10 V56"/><path d="M20 14 V24 C20 32 26 34 32 34 C38 34 44 32 44 24 V14"/><path d="M20 14 l-3 5 M44 14 l3 5 M32 10 l-4 5 M32 10 l4 5"/>` },
  { id: 'dog', rarity: 'jackpot', name: 'The Dog', line: 'Hears trouble before it exists.', traits: [],
    art: `<circle cx="20" cy="20" r="4.5"/><circle cx="32" cy="16" r="4.5"/><circle cx="44" cy="20" r="4.5"/><path d="M21 44 C21 36 26 31 32 31 C38 31 43 36 43 44 C43 52 21 52 21 44 Z"/>` },
  { id: 'teenager', rarity: 'common', name: 'The Teenager', line: 'Fearless, fast, and up anything vertical.', traits: [],
    art: `<path d="M10 34 C12 41 16 43 21 43 H43 C48 43 52 41 54 34"/><circle cx="24" cy="50" r="4"/><circle cx="41" cy="50" r="4"/><path d="M17 43 V47 M47 43 V47"/>` },
  { id: 'journalist', rarity: 'common', name: 'The Journalist', line: 'Words still open doors.', traits: [],
    art: `<rect x="10" y="22" width="44" height="28" rx="3"/><circle cx="32" cy="36" r="9"/><circle cx="32" cy="36" r="4"/><path d="M22 22 L26 14 H38 L42 22"/><path d="M47 28 l1.5 0"/>` },
];

export const KEEPSAKES = [
  { id: 'wedding_ring', rarity: 'jackpot', name: 'The Wedding Ring', line: 'You promised. You still mean it.', traits: [],
    art: `<circle cx="32" cy="38" r="14"/><path d="M32 24 L25 16 L32 9 L39 16 Z"/><path d="M25 16 H39"/>` },
  { id: 'photograph', rarity: 'common', name: 'The Photograph', line: 'Proof the world was real once.', traits: [],
    art: `<rect x="14" y="10" width="36" height="44" rx="1"/><rect x="18" y="14" width="28" height="28"/><circle cx="27" cy="24" r="3"/><path d="M18 38 L27 31 L33 36 L40 29 L46 34"/>` },
  { id: 'dog_collar', rarity: 'common', name: 'The Dog Collar', line: 'The tag still says his name.', traits: [],
    art: `<circle cx="32" cy="27" r="15"/><path d="M32 42 V47"/><circle cx="32" cy="52" r="5"/><path d="M27 13 h10"/>` },
  { id: 'bible', rarity: 'common', name: 'The Bible', line: 'Some words outlast the world.', traits: [],
    art: `<rect x="16" y="10" width="32" height="44" rx="2"/><path d="M21 10 V54"/><path d="M34 22 V38 M27 28 H41"/><path d="M40 54 v6"/>` },
  { id: 'military_tags', rarity: 'rare', name: 'The Military Tags', line: 'A name they can send home.', traits: ['Signal'],
    art: `<path d="M26 10 C15 15 14 26 21 29"/><path d="M38 10 C49 15 50 26 43 31"/><rect x="19" y="27" width="14" height="22" rx="4" transform="rotate(-9 26 38)"/><rect x="32" y="30" width="14" height="22" rx="4" transform="rotate(8 39 41)"/>` },
  { id: 'cassette_tape', rarity: 'common', name: 'The Cassette Tape', line: 'Side A, third song. You know the one.', traits: [],
    art: `<rect x="8" y="16" width="48" height="32" rx="3"/><circle cx="22" cy="31" r="5"/><circle cx="42" cy="31" r="5"/><path d="M27 31 H37"/><path d="M15 48 L19 40 H45 L49 48"/>` },
  { id: 'pocket_watch', rarity: 'common', name: 'The Pocket Watch', line: 'It keeps time for a world that stopped.', traits: [],
    art: `<circle cx="32" cy="36" r="16"/><circle cx="32" cy="36" r="12"/><path d="M32 36 V28 M32 36 L38 40"/><path d="M32 20 V14 M27 12 H37"/><path d="M41 16 C49 10 55 15 52 23"/>` },
  { id: 'map', rarity: 'ultra', name: 'The Map', line: 'Every road home, in his handwriting.', traits: ['Navigate'],
    art: `<path d="M12 14 L26 10 L38 14 L52 10 V50 L38 54 L26 50 L12 54 Z"/><path d="M26 10 V50 M38 14 V54"/><path d="M17 42 C23 36 29 40 33 32 C35 27 41 28 44 24" stroke-dasharray="3 3"/><path d="M43 20 l5 5 M48 20 l-5 5"/>` },
];

// Display labels for the capability traits an identity piece can carry —
// the same labels the event data uses as reqLabel, so a draft card's "✦
// PRY OPEN" whisper and an event's "REQUIRES Pry Open" lock visibly agree.
export const TRAIT_LABELS = {
  Ranged: 'RANGED',
  PryOpen: 'PRY OPEN',
  Heal: 'TREAT WOUNDS',
  Cure: 'CURE INFECTION',
  Purify: 'PURIFY WATER',
  Navigate: 'NAVIGATE',
  Scout: 'SCOUT AHEAD',
  Signal: 'CALL RESCUE',
  Fire: 'MAKE FIRE',
};

// The three draft pages, in order. `key` doubles as the identity slot name in
// App state AND the flag prefix (`weapon_crossbow`), so the three consumers
// (draft flow, choice gating, flag gating) can never drift apart.
//
// `banner` (Sprint 3) is each page's own header vignette — a wide ink
// drawing in the same hand as the item sketches, so every draft category
// opens on its own illustrated plate: the gear wall, the fire you're not
// alone at, the emptied pockets on a table.
export const SURVIVOR_SLOTS = [
  {
    key: 'weapon', numeral: 'I', title: 'THE WEAPON', prompt: 'What you carry in your hands.', items: WEAPONS,
    // The gear wall: a plank with pegs, a rifle hung at a tilt, a hatchet
    // and a coil of rope waiting beside it.
    banner: `
      <path d="M24 16 H296"/>
      <path d="M60 16 v6 M150 16 v6 M240 16 v6" stroke-opacity=".7"/>
      <path d="M70 26 L138 44"/><path d="M138 42 L152 48 L148 56 L136 50"/><rect x="88" y="24" width="10" height="4" rx="1.5"/>
      <path d="M186 22 V52"/><path d="M182 20 L198 26 C196 33 189 35 183 31 Z"/>
      <circle cx="248" cy="38" r="11"/><circle cx="248" cy="38" r="6"/><path d="M248 49 q4 6 10 7" stroke-opacity=".7"/>
    `,
  },
  {
    key: 'companion', numeral: 'II', title: 'THE COMPANION', prompt: 'Who walks beside you.', items: COMPANIONS,
    // The fire you're not alone at: two figures seated either side of a
    // small campfire, a dog curled close, smoke drifting.
    banner: `
      <path d="M30 54 H290" stroke-opacity=".7"/>
      <path d="M148 52 l6 -10 4 6 4 -8 4 12"/><path d="M142 54 l28 0 M146 50 l20 6" stroke-opacity=".8"/>
      <path d="M160 34 C156 28 164 24 160 18" stroke-opacity=".45"/>
      <path d="M104 54 V44 C104 38 110 36 114 40 C116 34 108 30 104 34 M104 44 q-8 2 -10 10" />
      <path d="M212 54 V44 C212 38 206 36 202 40 C200 34 208 30 212 34 M212 44 q8 2 10 10"/>
      <circle cx="102" cy="29" r="5"/><circle cx="214" cy="29" r="5"/>
      <path d="M236 52 q4 -8 12 -8 q10 0 12 8 M258 46 l4 -5 M238 46 q-4 -2 -3 -6" stroke-opacity=".85"/>
    `,
  },
  {
    key: 'keepsake', numeral: 'III', title: 'THE KEEPSAKE', prompt: 'What you refuse to leave behind.', items: KEEPSAKES,
    // Emptied pockets on a table before leaving: a photograph, a ring, a
    // pocket watch on its chain, a folded map.
    banner: `
      <path d="M28 54 H292"/>
      <rect x="72" y="18" width="30" height="34" rx="1"/><rect x="76" y="22" width="22" height="20"/><path d="M78 38 l6 -5 4 3 6 -5" stroke-opacity=".8"/>
      <circle cx="136" cy="44" r="8"/><path d="M136 34 l-4 -5 4 -4 4 4 Z" stroke-opacity=".9"/>
      <circle cx="186" cy="40" r="12"/><circle cx="186" cy="40" r="8.5"/><path d="M186 40 V34 M186 40 l4 3 M186 26 v-4 M198 34 q8 -6 14 0" stroke-opacity=".9"/>
      <path d="M232 26 L246 22 L260 26 L274 22 V48 L260 52 L246 48 L232 52 Z"/><path d="M246 22 V48 M260 26 V52" stroke-opacity=".7"/>
    `,
  },
];
