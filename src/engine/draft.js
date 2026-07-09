// Draft helpers for the Survivor Identity roll (data/survivor.js,
// screens/Draft.jsx): each of the three identity slots ROLLS four random
// pieces from its pool of eight — luck decides what fate offers, the
// player decides who they are from what landed. Rarity on the pieces is a
// visual/celebration axis only (same rule as the original item crates):
// shuffleFour draws uniformly regardless of tier.

export function shuffleFour(pool) {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 4);
}

// Identity pieces carry no stats, so today this always returns [] — but the
// dice overlay's attribution plumbing stays intact for anything a later
// sprint might add that DOES contribute to a check.

// For a given stat (combat/survival/wits), returns the loadout items that
// contributed to it, in draft order — e.g. [{id:'map', name:'County Map', amount:3}].
export function contributorsForStat(loadout, stat) {
  return loadout
    .filter((item) => item.stats && item.stats[stat])
    .map((item) => ({ id: item.id, name: item.name, amount: item.stats[stat] }));
}
