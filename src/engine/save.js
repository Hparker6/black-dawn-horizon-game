// Single versioned localStorage save, replacing the four ad-hoc keys
// (bdh_best/bdh_played/bdh_ach/bdh_endings) that had no schema version at
// all. `migrate()` is the one place a future version bump's upgrade logic
// goes (e.g. `if (raw.version < 2) { raw.companions = []; }`) — every field
// is filled with a safe default rather than trusting the stored shape, so a
// corrupt or partial save can never crash the app, just fall back quietly.
export const SAVE_VERSION = 1;
const SAVE_KEY = "bdh_save";

// Pre-versioning keys. Read once for a one-way migration into the new
// schema; never written to again, and never deleted either — leaving them
// alone costs nothing and keeps a rollback to an older build from finding
// its saved progress silently gone.
const LEGACY_KEYS = { best: "bdh_best", played: "bdh_played", ach: "bdh_ach", endings: "bdh_endings" };

function defaultSave() {
  return { version: SAVE_VERSION, best: 0, played: 0, ach: [], endings: [] };
}

function migrate(raw) {
  const base = defaultSave();
  if (!raw || typeof raw !== "object") return base;
  return {
    version: SAVE_VERSION,
    best: Number.isFinite(raw.best) ? raw.best : base.best,
    played: Number.isFinite(raw.played) ? raw.played : base.played,
    ach: Array.isArray(raw.ach) ? raw.ach : base.ach,
    endings: Array.isArray(raw.endings) ? raw.endings : base.endings,
  };
}

function migrateLegacy() {
  try {
    const best = +localStorage.getItem(LEGACY_KEYS.best) || 0;
    const played = +localStorage.getItem(LEGACY_KEYS.played) || 0;
    const ach = JSON.parse(localStorage.getItem(LEGACY_KEYS.ach) || "[]");
    const endings = JSON.parse(localStorage.getItem(LEGACY_KEYS.endings) || "[]");
    return migrate({ best, played, ach, endings });
  } catch (e) {
    return defaultSave();
  }
}

// Reads bdh_save; if it's missing (a save from before versioning existed,
// or a first run), falls back to the legacy keys so existing progress
// isn't lost, then upgrades whatever it finds through migrate() either way.
export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return migrate(JSON.parse(raw));
    return migrateLegacy();
  } catch (e) {
    return defaultSave();
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...save, version: SAVE_VERSION }));
  } catch (e) {}
}
