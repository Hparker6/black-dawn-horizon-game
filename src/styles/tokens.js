// Palette + shared style fragments, extracted verbatim from the DCLogic source.

export const bgDark = "#141109";
export const bgGradient =
  "radial-gradient(120% 120% at 50% 0%, #2a2416 0%, #141109 60%, #0b0906 100%)";
export const ribbonBg = "#20180d";

export const paper = "#f4efe4";
export const ink = "#1a1a1a";
export const blood = "#c62828";
export const gold = "#d4a843";
export const goldDark = "#a8801f";
export const green = "#2d5a3d";
export const muted = "#5a5548";

export const borderDashed = "#b7ac91";
export const borderSubtle = "#c9bfa6";

export const rareBorder = "#c9a227";
export const commonBorder = "#c2b697";
export const rareBg = "#faf6ec";
export const commonBg = "#eee5d2";
export const pickedBg = "#efe6d4";

export const lockedStripeA = "#efe8d8";
export const lockedStripeB = "#e8e0d0";
export const readyBg = "#eef1e6";

export const badgeLockedBg = "#ded4bd";
export const badgeReadyBg = green;
export const badgeCheckBg = "#e5c877";

// Choice-kind visual hierarchy (Events.jsx): a player should be able to
// categorize a choice's risk at a glance, before reading it — icon + color
// + weight, never color alone (colorblind-safe: every kind also carries a
// distinct icon and badge text). "safe" is deliberately a paler, quieter
// green than "ready"'s — safe is just "no risk," ready is "you're equipped
// for this," and they shouldn't read as the same level of confidence.
export const safeBorder = "#9db89a";
export const safeBg = "#f2f6f1";
export const checkBorder = "rgba(198,40,40,.45)";
export const checkBg = "rgba(198,40,40,.05)";

export const highlightBg = "#f6edd4";
export const highlightText = "#8a6a12";
export const rankMuted = "#8a7f66";

export const achStripeA = "#efe8d8";
export const achStripeB = "#e9e1d1";
export const achBorderLocked = "#d3c8ae";
export const textLockedChoice = "#7a725f";

export const fontDisplay = "'Creepster',cursive";
export const fontBody = "'Special Elite',monospace";
export const fontHand = "'Caveat',cursive";

export const noiseOverlayBg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const noiseHeaderBg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.25'/%3E%3C/svg%3E\")";

export const coffeeRingBg =
  "radial-gradient(circle at 92% 4%, transparent 0 28px, rgba(101,67,26,.30) 28px 30px, transparent 30px 36px, rgba(101,67,26,.15) 36px 38px, transparent 38px)";

// Reading screens (event/results) use a narrower centered column instead of
// the full wide paper panel, so line lengths stay comfortable and the frame
// hugs the (intentionally terse) prose like a journal page rather than
// stranding it in a wide field. The panel itself is now much wider (see
// App.jsx's outer wrapper) — this stays a comfortable measure rather than
// growing with it; the extra room becomes margin/framing around it instead
// of stretching line length.
export const readingColumnWidth = "680px";

// Faint ruled-notebook-paper lines, same ink tint as the coffee ring, so
// empty vertical space in a short entry reads as "blank journal page
// waiting to be filled" rather than a layout bug.
export const journalRuleBg = "linear-gradient(rgba(101,67,26,.06) 1px, transparent 1px)";

// A more present version of the rule above, shared by the two gameplay
// screens (draft + event) — both have more open space to fill than
// Results' recap text does, and both need to visibly read as "ruled
// journal page" rather than flat cream. journalRuleBg stays as-is on
// Results, which isn't part of this pass.
export const gameplayRuleBg = "linear-gradient(rgba(101,67,26,.16) 1px, transparent 1px)";
export const journalRuleSize = "100% 28px";

// Soft outer glow so the panel reads as a deliberately framed object sitting
// on the desk, not a rectangle floating in empty dark space — used on the
// app's outer wrapper only (see App.jsx), independent of any per-screen
// background.
export const panelFrameGlow = "0 0 0 1px rgba(212,168,67,.08), 0 0 90px 10px rgba(212,168,67,.05), 0 30px 80px -20px rgba(0,0,0,.8)";

// Draft item rarity. Deliberately NOT a power ladder — see the balance note
// in data/items.js. Colors/labels only; the CSS glow/shimmer/settle
// intensity per tier lives in index.css (rarityGlow*/bdhSettle* keyframes).
export const ultraBorder = "#9c6fd8";
export const ultraBg = "#f2ecfa";
export const ultraText = "#6a3fb0";
export const jackpotBorder = "#d4a843";
export const jackpotBg = "#fbf3de";
export const jackpotText = "#8a6a12";

export const RARITY_LABEL = { common: "COMMON", rare: "RARE", ultra: "ULTRA RARE", jackpot: "JACKPOT" };
export const RARITY_ORDER = ["common", "rare", "ultra", "jackpot"];

export function rarityColors(rarity) {
  if (rarity === "jackpot") return { border: jackpotBorder, bg: jackpotBg, text: jackpotText };
  if (rarity === "ultra") return { border: ultraBorder, bg: ultraBg, text: ultraText };
  if (rarity === "rare") return { border: rareBorder, bg: rareBg, text: highlightText };
  return { border: commonBorder, bg: commonBg, text: rankMuted };
}
