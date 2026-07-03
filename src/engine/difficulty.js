// Verbatim port of Component#diff() from the DCLogic source.
export function diff(difficulty) {
  if (difficulty === "Merciful") return { need: -1, dmg: 0.6, hp: 2 };
  if (difficulty === "Brutal") return { need: 1, dmg: 1.35, hp: -2 };
  return { need: 0, dmg: 1, hp: 0 };
}
