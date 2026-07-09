// Verbatim port of DCLogic's chooseOption / startDice / applyRes / buildChoices logic.
import { diff } from "./difficulty.js";
import { flagsAllow, addFlags } from "./flags.js";
import { resolveSecretEnding } from "./endings.js";
import { PACING, pickEventType, routeFromFlags, routeModifier } from "./pacing.js";

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
// excludeFlags/usedIds), the final event is returned — a run always ends
// on "The Signal," which is exempt from flag gating for exactly this
// reason: it must always be a valid pick, regardless of which flags did or
// didn't get set. `usedIds` (event `id`, not `title`) guarantees no event
// repeats within a run — keyed by id so renaming an event's display title
// can never affect which events have already been drawn.
//
// The draw itself is two-stage: engine/pacing.js first weighs *which type*
// (quiet/discovery/danger/climax) fits this point in the run — via
// `runEventsTarget` and `remainingSlots`, converted to a 0..1 progress, plus
// `reliefBias` from the last outcome — then this function filters the
// eligible pool to that type and picks uniformly within it. If that type
// has nothing left to draw, it falls back through PACING.fallbackOrder
// (nearest type in tone) before finally drawing from whatever's eligible at
// all, so a thin pool degrades gracefully instead of erroring or repeating.
export function pickNextEvent({ allEvents, usedIds, flags, remainingSlots, runEventsTarget, reliefBias }) {
  const finalEvent = allEvents.find((e) => e.final);
  if (remainingSlots <= 0) return finalEvent;
  const eligible = allEvents.filter((e) => !e.final && !usedIds.includes(e.id) && flagsAllow(e, flags));
  if (eligible.length === 0) return finalEvent;

  const progress = runEventsTarget > 0 ? 1 - remainingSlots / runEventsTarget : 0;
  const { dangerWeightMultiplier } = routeModifier(routeFromFlags(flags));
  const type = pickEventType(progress, reliefBias, dangerWeightMultiplier);
  const byType = (t) => eligible.filter((e) => (e.type || "discovery") === t);

  let pool = byType(type);
  if (pool.length === 0) {
    for (const fallbackType of PACING.fallbackOrder[type] || []) {
      pool = byType(fallbackType);
      if (pool.length > 0) break;
    }
  }
  if (pool.length === 0) pool = eligible;

  return pool[Math.floor(Math.random() * pool.length)];
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

// Mirrors applyRes(res): folds a result object into day/hp/died/endingId/gameOver,
// plus any flags the outcome sets (setFlags), merged into the run's flag list.
//
// `endingId` is a stable id (matches data/endings.js: ENDINGS[].id), never
// a display label — res.endingId/res.deathEndingId on the final event's
// choices carry ids for exactly this reason, so renaming an ending's label
// can never disconnect it from achievements/the endings collection/recaps.
//
// `secretEndings` (data/endings.js: SECRET_ENDINGS) is checked whenever
// this beat actually ends the run — gameOver, whether that's a survival
// win at the final event or a death anywhere (an early death counts: a
// themed death secret is tied to a flag set earlier in the run, not to
// which specific event happened to land the killing blow). A secret
// ending, if the run's flags/day qualify for one, overrides the `endingId`
// the triggering outcome would otherwise have produced — resolveSecretEnding
// itself keeps death-only and survival-only entries from ever crossing.
export function applyResult(runState, res, difficulty, secretEndings = []) {
  const m = diff(difficulty);
  // Route choice (data/intro.js) nudges the day-cost of every event rather
  // than any single event's authored value — highway burns fewer days per
  // stop (faster, riskier via pickNextEvent's danger weighting above),
  // backroads more (slower, safer). Rounded so a 1-day event never rounds
  // to 0 and stalls the destination ETA.
  const { daysPerEventMultiplier } = routeModifier(routeFromFlags(runState.flags));
  const day = runState.day + Math.max(res.days ? 1 : 0, Math.round((res.days || 0) * daysPerEventMultiplier));
  let dmg = res.health || 0;
  if (dmg < 0) dmg = Math.round(dmg * m.dmg);
  const hp = Math.max(0, Math.min(runState.hpMax, runState.hp + dmg));
  const died = hp <= 0;
  const flags = addFlags(runState.flags, res.setFlags);
  let endingId = runState.endingId;
  let gameOver = false;
  if (res.win) {
    endingId = res.endingId;
    gameOver = true;
  } else if (res.winIfAlive) {
    endingId = died ? res.deathEndingId : res.endingId;
    gameOver = true;
  }
  if (died) gameOver = true;
  if (gameOver) {
    const secret = resolveSecretEnding(secretEndings, { died, day, flags });
    if (secret) endingId = secret.id;
  }
  return { day, hp, died, endingId, gameOver, logEntry: res.msg, flags };
}

// True if a node's identity requirement (requiredWeapon / requiredCompanion
// / requiredKeepsake — any subset) is satisfied by the run's identity. A
// node with no identity requirement always matches. Shared by choice
// gating, event flavor, and outcome variants so "does this belong to my
// build" can never mean three different things.
export function identityMatches(node, identity) {
  const id = identity || {};
  const owns = (piece, requiredId) => !!piece && piece.id === requiredId;
  if (node.requiredWeapon && !owns(id.weapon, node.requiredWeapon)) return false;
  if (node.requiredCompanion && !owns(id.companion, node.requiredCompanion)) return false;
  if (node.requiredKeepsake && !owns(id.keepsake, node.requiredKeepsake)) return false;
  return true;
}

// Sprint 2: identity event flavor. An event may carry `identityFlavor:
// [{ requiredWeapon|requiredCompanion|requiredKeepsake, text }]` — a line
// of the scene as YOUR build perceives it (the dog smelling someone inside,
// the hunter counting figures before you do). First match wins and at most
// one line ever shows, same restraint as route flavor: it's the world
// recognizing who you are, not a build summary.
export function identityFlavorFor(event, identity) {
  for (const f of event.identityFlavor || []) {
    if (identityMatches(f, identity)) return f.text;
  }
  return null;
}

// Sprint 2: alternate outcomes. A choice may carry `identityVariants:
// [{ requiredWeapon|..., result?, success?, fail? }]` — when the run's
// identity matches a variant, its outcome objects replace the base ones
// (whole-object replacement, not a merge, so a variant is always a
// complete, self-consistent outcome). First matching variant wins. This is
// how the SAME choice ends differently because of who's making it — the
// nurse catching bad water symptoms early, the dog buying you a head
// start — without the choice list growing another near-duplicate entry.
export function resolveOutcome(choice, identity) {
  const base = { result: choice.result, success: choice.success, fail: choice.fail };
  for (const v of choice.identityVariants || []) {
    if (identityMatches(v, identity)) {
      return { result: v.result || base.result, success: v.success || base.success, fail: v.fail || base.fail };
    }
  }
  return base;
}

// Mirrors buildChoices(): classifies each choice as locked/ready/check/plain
// so the Events screen can render the right style + badge for it.
//
// Flag gating layers on top of (and takes priority over) the existing
// trait/check/plain classification: excludeFlags removes a choice from the
// list entirely (it no longer makes narrative sense to offer it), while
// requiresFlags shows it locked — same visual treatment as a missing trait —
// since "you haven't earned this option yet" is the same idea either way.
//
// Survivor-identity gating (Sprint 1): a choice may carry requiredWeapon /
// requiredCompanion / requiredKeepsake (an id from data/survivor.js).
// Unlike trait requirements — which show LOCKED, teasing what a different
// build could do — identity choices are HIDDEN entirely when the run's
// identity doesn't match. With 8 options per slot, showing every other
// survivor's locked option on every event would drown the choice list; the
// payoff is the reverse read: everything you DO see is yours. A matched
// identity choice classifies as "ready" (weapon/companion — same confident
// no-roll green as an owned trait) or "keepsake" (its own quieter, gold
// treatment in Events.jsx — emotional, not tactical), badged with the
// piece's name so the player always knows which pick unlocked it.
//
// Every kind now returns a badge (plain gets "SAFE" instead of none) so the
// choice-hierarchy pass in Events.jsx never depends on color/icon alone —
// there's always a plain-language label backing it up, for colorblind
// players and anyone skimming fast.
export function classifyChoices(event, traits, flags, difficulty, identity) {
  const m = diff(difficulty);
  const id = identity || {};
  return (event.choices || [])
    .filter((c) => !(c.excludeFlags && c.excludeFlags.some((f) => (flags || []).includes(f))))
    .filter((c) => identityMatches(c, id))
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
      let badge = "✓  SAFE";
      if (locked) {
        kind = "locked";
        badge = "🔒  REQUIRES " + (c.reqLabel || c.requiredTrait);
      } else if (c.requiredKeepsake && !c.check) {
        // The keepsake's name in the badge, not a generic label — the whole
        // point of a keepsake choice is that it's THIS object speaking.
        kind = "keepsake";
        badge = "❧  " + id.keepsake.name.toUpperCase();
      } else if ((c.requiredWeapon || c.requiredCompanion) && !c.check) {
        const piece = c.requiredWeapon ? id.weapon : id.companion;
        kind = "ready";
        badge = "✦  " + piece.name.toUpperCase() + "  ·  NO ROLL";
      } else if (c.requiredTrait) {
        kind = "ready";
        badge = "✦  " + (c.reqLabel || "READY").toUpperCase() + "  ·  NO ROLL";
      } else if (c.check) {
        kind = "check";
        // ⚠ (not the old ⚄ die) — matches Events.jsx's risky-choice roundel,
        // and reads as "risky, your call" rather than a die glyph some
        // fonts render as a blank/forbidden-looking box.
        badge = "⚠  " + c.check.label + " CHECK · NEED " + (c.check.needed + m.need);
      }
      return { choice: c, kind, badge, hasBadge: true, locked };
    });
}
