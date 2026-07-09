// Verbatim port of DCLogic's tierFor()/tier(), the finish() achievement-unlock
// block, and the leaderboard "— YOU —" row merge from renderVals().
import { TIERS, ROOKIE_TIER, ROOKIE_DEATH_DAY_CUTOFF } from "../data/endings.js";

export function tierFor(days) {
  const hit = TIERS.find((t) => days < t.maxDays);
  return (hit || TIERS[TIERS.length - 1]).label;
}

export function tier({ died, day }) {
  if (died && day < ROOKIE_DEATH_DAY_CUTOFF) return ROOKIE_TIER.label;
  return tierFor(day);
}

// "Against the Odds" threshold: a check whose effective needed is at least
// this counts as a clutch roll. Was 10 back when drafted items granted stat
// bonuses; the Survivor Identity rebalance (see data/events.js) recentered
// every check for a bonus-less d10, so the hardest roll in the game is now
// the final gauntlet's 7 — the medal tracks that same "hardest roll there
// is" meaning rather than a number nothing can reach anymore.
export const CLUTCH_NEEDED = 7;

// Mirrors the achievement-unlock block inside finish(). `endingId` is the
// stable id (data/endings.js: ENDINGS[].id) — NOT the display label — so
// renaming "Military Rescue" can never silently break the "rescue" medal.
export function unlockAchievements({ ach, day, died, endingId, runClutch, runFailed }) {
  const un = new Set(ach);
  const before = un.size;
  const t = tier({ died, day });
  un.add("first");
  if (day >= 20) un.add("survivor");
  if (day >= 34) un.add("veteran");
  if (!died && t === "Legend") un.add("legend");
  if (endingId === "military_rescue") un.add("rescue");
  if (runClutch) un.add("clutch");
  if (!died && !runFailed) un.add("pacifist");
  if (died && day <= 3) un.add("unlucky");
  const nextAch = [...un];
  return { ach: nextAch, newAch: nextAch.length - before };
}

// Mirrors the leaderboard merge in renderVals(): insert a "— YOU —" row scored
// by `best`, sort desc, keep top 10, and force the YOU row into the list even
// if it would otherwise fall outside the top 10 (dropping the natural #10).
export function buildLeaderboard(leaders, best) {
  const arr = [...leaders];
  if (best > 0) arr.push({ name: "— YOU —", days: best, note: tierFor(best), you: true });
  arr.sort((a, b) => b.days - a.days);
  let top = arr.slice(0, 10);
  if (best > 0 && !top.some((r) => r.you)) {
    top = top.slice(0, 9);
    top.push(arr.find((r) => r.you));
  }
  return top;
}
