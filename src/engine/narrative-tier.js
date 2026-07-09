import { EVENTS } from "../data/events.js";
import { ENDINGS } from "../data/endings.js";

// Presentation-only narrative tiers. Every event already belongs to one of
// five tiers of story weight — the finale, keepsake memories, callbacks,
// hinge decisions, and plain atmospheric beats — but until now they all
// rendered identically, so a run's most consequential pages looked exactly
// like its filler. This module classifies an event into its tier and hands
// the Events screen a small intro treatment for it (a quiet banner or a
// hand-written journal note), so the player FEELS "this one matters"
// without ever being shown the machinery.
//
// Deliberately derived, not annotated: the classifier reads the shape the
// event data already has (final flag, requiresFlags, setFlags) rather than
// adding a `tier:` field to every event, so new events sort themselves and
// the tier can never drift out of sync with what the event actually does.
// NOTHING in here is read by the picker, resolver, pacing, or endings —
// deleting this module would change how pages look, never how a run plays.

// Flags that something downstream actually consumes — an event or ending
// gated on them (requiresFlags/excludeFlags). Setting one of these is what
// makes a decision a hinge: it demonstrably comes back. Flags that are set
// but never consumed anywhere (pure record-keeping) don't qualify, which
// keeps the IMPORTANT DECISION banner scarce enough to mean something.
let consequentialFlagsCache = null;
function consequentialFlags() {
  if (consequentialFlagsCache) return consequentialFlagsCache;
  const set = new Set();
  for (const e of EVENTS) {
    for (const f of e.requiresFlags || []) set.add(f);
    for (const f of e.excludeFlags || []) set.add(f);
  }
  for (const end of ENDINGS) {
    for (const f of end.requiresFlags || []) set.add(f);
  }
  consequentialFlagsCache = set;
  return set;
}

// Identity/route flags are stamped by the draft and intro, not earned by an
// in-run decision — an event gated on one is personal (keepsake) or just
// build-gated, never "your past catching up".
const DRAFT_FLAG_PREFIXES = ["keepsake_", "weapon_", "companion_", "route_"];
function isDraftFlag(flag) {
  return DRAFT_FLAG_PREFIXES.some((p) => flag.startsWith(p));
}

function outcomeNodes(choice) {
  const nodes = [choice.result, choice.success, choice.fail];
  for (const v of choice.identityVariants || []) nodes.push(v.result, v.success, v.fail);
  return nodes.filter(Boolean);
}

function setsConsequentialFlag(event) {
  const consequential = consequentialFlags();
  return (event.choices || []).some((choice) =>
    outcomeNodes(choice).some((node) => (node.setFlags || []).some((f) => consequential.has(f)))
  );
}

// Precedence matters: keepsake events also set flags (the whole point), and
// callbacks may too — the more personal/specific tier wins.
export function narrativeTier(event) {
  if (event.final) return "finale";
  const required = event.requiresFlags || [];
  if (required.some((f) => f.startsWith("keepsake_"))) return "keepsake";
  if (required.some((f) => !isDraftFlag(f))) return "callback";
  if (setsConsequentialFlag(event)) return "hinge";
  return "atmospheric";
}

// ---------------------------------------------------------------------------
// Intro copy per tier. Notes are picked by a stable hash of the event id
// (same rationale as pacing.js's route flavor): the same event always opens
// with the same line, instead of flickering between candidates on re-render
// or re-reading differently on a second run.

const CALLBACK_NOTES = [
  "You recognize this place.",
  "Old choices have long shadows.",
  "The past catches up.",
  "This road remembers you.",
];

// One voice per keepsake where its event exists — the object interrupting
// the journey in its own specific way. Generic lines cover any keepsake
// event added later before its line is written.
const KEEPSAKE_NOTES = {
  wedding_ring: "You reach for the ring without thinking. You always do.",
  bible: "The cover gives under your thumb, soft from years of hands.",
  cassette_tape: "The tape shifts in your pocket. Side A, against your ribs.",
  dog_collar: "The tag clicks softly where it hangs. You stop walking.",
};
const KEEPSAKE_NOTES_GENERIC = [
  "You reach into your pack.",
  "The weight of your keepsake returns.",
  "A memory interrupts your thoughts.",
  "The object feels heavier tonight.",
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function stablePick(pool, seed) {
  return pool[hashString(seed) % pool.length];
}

function keepsakeIdOf(event) {
  const flag = (event.requiresFlags || []).find((f) => f.startsWith("keepsake_"));
  return flag ? flag.slice("keepsake_".length) : null;
}

// What the Events screen renders above the entry, or null for atmospheric
// events (which keep their current look untouched). `banner` is the framed
// small-caps treatment (hinge/finale); `note` is a hand-written journal
// aside (callback/keepsake). Neither ever names an ending, an odds change,
// or a mechanic — only that this moment carries weight.
export function eventPresentation(event) {
  const tier = narrativeTier(event);
  if (tier === "finale") {
    return { tier, banner: { title: "FINAL ENTRY", subtitle: "The Coast Guard Station" } };
  }
  if (tier === "hinge") {
    return { tier, banner: { title: "IMPORTANT DECISION", subtitle: "Some choices leave lasting marks." } };
  }
  if (tier === "callback") {
    return { tier, note: stablePick(CALLBACK_NOTES, event.id) };
  }
  if (tier === "keepsake") {
    const note = KEEPSAKE_NOTES[keepsakeIdOf(event)] || stablePick(KEEPSAKE_NOTES_GENERIC, event.id);
    return { tier, note };
  }
  return null;
}
