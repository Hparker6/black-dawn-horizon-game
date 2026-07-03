// Verbatim port of DCLogic's chooseOption / startDice / applyRes / buildChoices logic.
import { diff } from "./difficulty.js";
import { flagsAllow, addFlags } from "./flags.js";
import { resolveSecretEnding } from "./endings.js";

export function rollD10() {
  return 1 + Math.floor(Math.random() * 10);
}

// Picks ONE event at a time, re-evaluating eligibility against the run's
// CURRENT flags every time it's called — not a fixed sequence drawn once at
// run start. That's what lets a flag set mid-run make its callback event
// eligible for the very next draw: the callback wasn't in a pre-picked list
// to begin with, it just becomes one of the eligible options the moment its
// flags are satisfied.
//
// `remainingSlots` counts down the run's planned non-final event count
// (decided once at run start — see runEventsTarget in App.jsx); once it
// hits 0, or once there's nothing left eligible to draw (pool exhausted by
// excludeFlags/usedTitles), the final event is returned — a run always ends
// on "The Signal," which is exempt from flag gating for exactly this
// reason: it must always be a valid pick, regardless of which flags did or
// didn't get set. `usedTitles` guarantees no event repeats within a run.
export function pickNextEvent({ allEvents, usedTitles, flags, remainingSlots }) {
  const finalEvent = allEvents.find((e) => e.final);
  if (remainingSlots <= 0) return finalEvent;
  const eligible = allEvents.filter((e) => !e.final && !usedTitles.includes(e.title) && flagsAllow(e, flags));
  if (eligible.length === 0) return finalEvent;
  return eligible[Math.floor(Math.random() * eligible.length)];
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
//
// `secretEndings` (data/endings.js: SECRET_ENDINGS) is checked only when
// this result is an actual win (res.win or res.winIfAlive-and-alive) — i.e.
// only at the final event. A secret ending, if the run's flags qualify for
// one, overrides the `ending` the chosen final-event option would otherwise
// have produced. Dying never triggers a secret ending — a death keeps its
// own ending untouched.
export function applyResult(runState, res, difficulty, secretEndings = []) {
  const m = diff(difficulty);
  const day = runState.day + (res.days || 0);
  let dmg = res.health || 0;
  if (dmg < 0) dmg = Math.round(dmg * m.dmg);
  const hp = Math.max(0, Math.min(runState.hpMax, runState.hp + dmg));
  const died = hp <= 0;
  const flags = addFlags(runState.flags, res.setFlags);
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
  if (!died && (res.win || res.winIfAlive)) {
    const secret = resolveSecretEnding(secretEndings, { died, flags });
    if (secret) ending = secret.label;
  }
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
