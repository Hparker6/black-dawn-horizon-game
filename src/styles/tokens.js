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

export const highlightBg = "#f6edd4";
export const highlightText = "#8a6a12";
export const rankMuted = "#8a7f66";

export const achStripeA = "#efe8d8";
export const achStripeB = "#e9e1d1";
export const achBorderLocked = "#d3c8ae";
export const textLockedChoice = "#7a725f";

export const fontDisplay = "'Creepster',cursive";
export const fontBody = "'Special Elite',monospace";

export const noiseOverlayBg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const noiseHeaderBg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.25'/%3E%3C/svg%3E\")";

export const coffeeRingBg =
  "radial-gradient(circle at 92% 4%, transparent 0 28px, rgba(101,67,26,.30) 28px 30px, transparent 30px 36px, rgba(101,67,26,.15) 36px 38px, transparent 38px)";

// Reading screens (event/results) use a narrower centered column instead of
// the full wide paper panel, so line lengths stay comfortable and the frame
// hugs the (intentionally terse) prose like a journal page rather than
// stranding it in a wide field.
export const readingColumnWidth = "620px";

// Faint ruled-notebook-paper lines, same ink tint as the coffee ring, so
// empty vertical space in a short entry reads as "blank journal page
// waiting to be filled" rather than a layout bug.
export const journalRuleBg = "linear-gradient(rgba(101,67,26,.06) 1px, transparent 1px)";
export const journalRuleSize = "100% 28px";
