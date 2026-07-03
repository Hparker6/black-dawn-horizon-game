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

// Mirrors the achievement-unlock block inside finish().
export function unlockAchievements({ ach, day, died, ending, runClutch, runFailed }) {
  const un = new Set(ach);
  const before = un.size;
  const t = tier({ died, day });
  un.add("first");
  if (day >= 20) un.add("survivor");
  if (day >= 34) un.add("veteran");
  if (!died && t === "Legend") un.add("legend");
  if (ending === "Military Rescue") un.add("rescue");
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
