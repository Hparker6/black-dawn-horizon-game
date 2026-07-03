// Verbatim port of DCLogic's draft helpers (rand/shuffleFour) plus the pure
// portion of onPickCard's state math (stat/health/trait/loadout accumulation).
// Screen/round transition timing (the 620ms "TAKEN" stamp delay) stays in
// App.jsx since it's a setTimeout choreography, not pure logic.

export function rand(a) {
  return a[Math.floor(Math.random() * a.length)];
}

export function shuffleFour(pool) {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 4);
}

export function applyCardPick({ stats, hpMax, hp, traits, loadout }, card) {
  const nextStats = { ...stats };
  let nextHpMax = hpMax;
  let nextHp = hp;
  for (const k in card.stats) {
    if (k === "health") {
      nextHpMax += card.stats[k];
      nextHp += card.stats[k];
    } else {
      nextStats[k] += card.stats[k];
    }
  }
  const nextTraits = card.trait ? [...traits, card.trait] : traits;
  // stats carried alongside name/trait so a later dice check can attribute
  // its bonus back to the specific drafted item(s) that produced it. rarity
  // carried so the persistent loadout display (LoadoutStrip) can color-code
  // each item the same way the draft card did.
  const nextLoadout = [...loadout, { name: card.name, trait: card.trait, stats: card.stats, rarity: card.rarity }];
  return { stats: nextStats, hpMax: nextHpMax, hp: nextHp, traits: nextTraits, loadout: nextLoadout };
}

// For a given stat (combat/survival/wits), returns the loadout items that
// contributed to it, in draft order — e.g. [{name:'County Map', amount:3}].
export function contributorsForStat(loadout, stat) {
  return loadout
    .filter((item) => item.stats && item.stats[stat])
    .map((item) => ({ name: item.name, amount: item.stats[stat] }));
}
