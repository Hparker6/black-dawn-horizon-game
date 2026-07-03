// Verbatim port of DCLogic's chooseOption / startDice / applyRes / buildChoices logic.
import { diff } from "./difficulty.js";

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
export function sampleRunEvents(events, count) {
  const finalEvent = events.find((e) => e.final);
  const pool = events.filter((e) => !e.final);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked = shuffled.slice(0, Math.min(count, shuffled.length));
  return finalEvent ? [...picked, finalEvent] : picked;
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

// Mirrors applyRes(res): folds a result object into day/hp/died/ending/gameOver.
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
  return { day, hp, died, ending, gameOver, logEntry: res.msg };
}

// Mirrors buildChoices(): classifies each choice as locked/ready/check/plain
// so the Events screen can render the right style + badge for it.
export function classifyChoices(event, traits, difficulty) {
  const m = diff(difficulty);
  return (event.choices || []).map((c) => {
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
