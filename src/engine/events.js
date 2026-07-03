// Verbatim port of DCLogic's chooseOption / startDice / applyRes / buildChoices logic.
import { diff } from "./difficulty.js";
import { flagsAllow, addFlags } from "./flags.js";

export function rollD10() {
  return 1 + Math.floor(Math.random() * 10);
}

// Picks a random subset of non-final events for one run, then appends the
// final event (if any) last. This is new: the ported source always walked
// EVENTS start-to-finish in fixed order. With the pool grown to ~28, playing
// all of them every run would be both repetitive-free-in-name-only (same
// fixed order every time) and much longer than the original pacing, so a run
// now draws `count` events at random instead. Nothing about draft, dice,
// scoring, or difficulty changed — only which events a given run sees.
//
// `flags` gates which events are even eligible for the initial draw — an
// event with requiresFlags can't be drawn here since flags is always empty
// at run start (nothing has happened yet). Those events only enter play via
// unlockFlagEvents() below, once their flag actually gets set mid-run. The
// final event is exempt from flag gating on purpose: a run always needs a
// valid ending regardless of which flags did or didn't get set.
export function sampleRunEvents(events, count, flags = []) {
  const finalEvent = events.find((e) => e.final);
  const pool = events.filter((e) => !e.final && flagsAllow(e, flags));
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked = shuffled.slice(0, Math.min(count, shuffled.length));
  return finalEvent ? [...picked, finalEvent] : picked;
}

// Called after every flag change. Checks the full event pool for anything
// that (a) now qualifies given the run's current flags, (b) requires at
// least one flag (so it's a genuine callback, not a normal event), and
// (c) isn't already somewhere in this run's sequence — then splices it in a
// few events ahead of where the player currently is, always before the
// final event. This is what makes "earlier choices unlock a later event"
// possible despite the run's sequence being drawn once at the start: the
// callback wasn't eligible at draw time (its flag didn't exist yet), so it
// gets inserted the moment it becomes eligible instead.
export function unlockFlagEvents(runEvents, eventIndex, flags, allEvents) {
  const candidates = allEvents.filter(
    (e) => !e.final && e.requiresFlags && e.requiresFlags.length > 0 && !runEvents.includes(e) && flagsAllow(e, flags)
  );
  if (candidates.length === 0) return runEvents;

  const offset = 2 + Math.floor(Math.random() * 3); // 2-4 events ahead: not instant, not buried
  const lastIndex = runEvents.length - 1; // final event's slot — never insert after it
  const insertAt = Math.min(eventIndex + 1 + offset, lastIndex);

  const next = [...runEvents];
  next.splice(insertAt, 0, ...candidates);
  return next;
}

// Mirrors the roll+bonus vs needed math inside startDice()'s completion timeout.
export function resolveCheck(check, stats, difficulty) {
  const m = diff(difficulty);
  const roll = rollD10();
  const bonus = stats[check.stat] || 0;
  const needed = check.needed + m.need;
  const total = roll + bonus;
  const success = total >= needed;
  return { roll, bonus, needed, total, success };
}

// Mirrors applyRes(res): folds a result object into day/hp/died/ending/gameOver,
// plus any flags the outcome sets (setFlags), merged into the run's flag list.
export function applyResult(runState, res, difficulty) {
  const m = diff(difficulty);
  const day = runState.day + (res.days || 0);
  let dmg = res.health || 0;
  if (dmg < 0) dmg = Math.round(dmg * m.dmg);
  const hp = Math.max(0, Math.min(runState.hpMax, runState.hp + dmg));
  const died = hp <= 0;
  let ending = runState.ending;
  let gameOver = false;
  if (res.win) {
    ending = res.ending;
    gameOver = true;
  } else if (res.winIfAlive) {
    ending = died ? res.deathEnding : res.ending;
    gameOver = true;
  }
  if (died) gameOver = true;
  const flags = addFlags(runState.flags, res.setFlags);
  return { day, hp, died, ending, gameOver, logEntry: res.msg, flags };
}

// Mirrors buildChoices(): classifies each choice as locked/ready/check/plain
// so the Events screen can render the right style + badge for it.
//
// Flag gating layers on top of (and takes priority over) the existing
// trait/check/plain classification: excludeFlags removes a choice from the
// list entirely (it no longer makes narrative sense to offer it), while
// requiresFlags shows it locked — same visual treatment as a missing trait —
// since "you haven't earned this option yet" is the same idea either way.
export function classifyChoices(event, traits, flags, difficulty) {
  const m = diff(difficulty);
  return (event.choices || [])
    .filter((c) => !(c.excludeFlags && c.excludeFlags.some((f) => (flags || []).includes(f))))
    .map((c) => {
      const flagsOk = flagsAllow(c, flags || []);
      if (!flagsOk) {
        return {
          choice: c,
          kind: "locked",
          badge: "🔒  REQUIRES " + (c.flagLabel || "an earlier choice"),
          hasBadge: true,
          locked: true,
        };
      }
      const has = c.requiredTrait ? traits.includes(c.requiredTrait) : true;
      const locked = !!c.requiredTrait && !has;
      let kind = "plain";
      let badge = "";
      let hasBadge = true;
      if (locked) {
        kind = "locked";
        badge = "🔒  REQUIRES " + (c.reqLabel || c.requiredTrait);
      } else if (c.requiredTrait) {
        kind = "ready";
        badge = "✦  " + (c.reqLabel || "READY").toUpperCase() + "  ·  NO ROLL";
      } else if (c.check) {
        kind = "check";
        badge = "⚄  " + c.check.label + " CHECK · NEED " + (c.check.needed + m.need);
      } else {
        hasBadge = false;
      }
      return { choice: c, kind, badge, hasBadge, locked };
    });
}
