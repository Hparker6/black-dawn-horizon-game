import { tier } from "./scoring.js";

export const PLAY_URL = "https://blackdawnhorizon.com";

export const SHARE_LABEL_DEFAULT = "SHARE THE STORY";
export const SHARE_LABEL_SHARED = "SHARED ✓";
export const SHARE_LABEL_COPIED = "COPIED — PASTE IT ANYWHERE";
export const SHARE_LABEL_RESET_MS = 1800;

// Spoiler-free: day count, tier, ending label, and equipment names only —
// never the run's event log/choices. The URL is appended in the text itself
// (not just passed via navigator.share's `url` field) because not every
// share target honors separate fields — Messages/WhatsApp/etc. all read the
// text body directly.
export function buildShareText({ day, died, ending, loadout }) {
  const endingLabel = ending || (died ? "Died on the road" : "Reached the coast");
  const items = (loadout || []).map((it) => it.name).join(", ");
  const loadoutLine = items ? ` Loadout: ${items}.` : "";
  return (
    `BLACK DAWN HORIZON — I survived ${day} days (${tier({ died, day })}).\n` +
    `Ending: ${endingLabel}.${loadoutLine}\n` +
    `How long would you survive?\n` +
    PLAY_URL
  );
}

export async function copyShareText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

// Tries the native OS share sheet first (one-tap to Messages/WhatsApp/
// Instagram/etc, especially valuable on mobile); falls back to clipboard
// when navigator.share doesn't exist (most desktop browsers) or otherwise
// fails. A user-cancelled share sheet is not a failure — it's reported
// distinctly so the caller doesn't flash a "copied" message the user never
// asked for.
export async function shareRun({ day, died, ending, loadout }) {
  const text = buildShareText({ day, died, ending, loadout });

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "Black Dawn Horizon", text, url: PLAY_URL });
      return { method: "share" };
    } catch (e) {
      if (e && e.name === "AbortError") return { method: "cancelled" };
      // fall through to clipboard for any other failure
    }
  }

  const copied = await copyShareText(text);
  return { method: copied ? "clipboard" : "failed" };
}
