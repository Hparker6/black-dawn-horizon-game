// Verbatim port of DCLogic's onShare() text + clipboard logic.
import { tier } from "./scoring.js";

export const SHARE_LABEL_DEFAULT = "SHARE THE STORY";
export const SHARE_LABEL_COPIED = "COPIED TO CLIPBOARD ✓";
export const SHARE_LABEL_RESET_MS = 1800;

export function buildShareText({ day, died, ending }) {
  return `BLACK DAWN HORIZON — I survived ${day} days (${tier({ died, day })}). Ending: ${
    ending || (died ? "Died on the road" : "Reached the coast")
  }. How long would you survive?`;
}

export async function copyShareText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // matches source: clipboard failures are silently swallowed
  }
}
