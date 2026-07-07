import * as t from "../styles/tokens.js";
import { ACH } from "../data/achievements.js";
import { ENDINGS } from "../data/endings.js";
import SurvivalTips from "./SurvivalTips.jsx";

// Percentage-of-image bounding boxes, hand-measured against the notebook
// artwork's 1024x682 pixel grid (public/notebook-home.jpg). Every overlay
// below is positioned from this table, not eyeballed inline, so re-tuning a
// zone against the art only ever means editing one number here.
const TITLE_ZONE = { left: 9.8, top: 11.0, width: 34.7, height: 36.7 };
const STRIP_LEFT = 13.7;
const STRIP_WIDTH = 27.3;
const STRIP_ZONES = [
  { top: 53.2, height: 5.4 }, // taped strip 1 - BEGIN
  { top: 59.1, height: 5.4 }, // taped strip 2 - LEADERBOARD
  { top: 65.0, height: 5.1 }, // taped strip 3 - ACHIEVEMENTS
  { top: 70.4, height: 5.1 }, // taped strip 4 - ENDINGS
];
const TIPS_ZONE = { left: 58.1, top: 12.5, width: 16.6, height: 19.0 };
const JOURNAL_ZONE = { left: 57.1, top: 65.3, width: 37.1, height: 27.9 };

function zoneStyle(z) {
  return { position: "absolute", left: `${z.left}%`, top: `${z.top}%`, width: `${z.width}%`, height: `${z.height}%` };
}

function stripStyle(z) {
  return { ...zoneStyle({ left: STRIP_LEFT, width: STRIP_WIDTH, top: z.top, height: z.height }) };
}

// Recap lines for the bottom-right "survival journal" scrap — a running
// summary derived from whatever the save file already tracks (best/played/
// achievements/endings), not a separate per-run history log. Framed as
// journal entries so it reads as the character's own hand, not a stats
// panel.
function journalLines({ best, played, ach, endingsFound }) {
  if (!played) {
    return ["No entries yet.", "The road is still ahead of you."];
  }
  const lines = [`${played} run${played === 1 ? "" : "s"} logged so far.`];
  if (best > 0) lines.push(`Longest stretch survived: ${best} day${best === 1 ? "" : "s"}.`);
  lines.push(`${ach.length} / ${ACH.length} field commendations earned.`);
  lines.push(`${endingsFound.length} / ${ENDINGS.length} endings witnessed.`);
  return lines;
}

export default function NotebookHome({ best, played, ach, endingsFound, onPlay, onTabLeader, onTabAch, onTabEndings }) {
  const lines = journalLines({ best, played, ach, endingsFound });

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "6px 0" }}>
      <div
        style={{
          position: "relative",
          width: "min(100%, 1150px, calc(86vh * 1024 / 682))",
          aspectRatio: "1024 / 682",
          animation: "bdhFadeUp .5s ease both",
        }}
      >
        <img
          src="/notebook-home.jpg"
          alt="A weathered field journal, open to its first page."
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", userSelect: "none", pointerEvents: "none" }}
          draggable={false}
        />

        {/* Left page, large blank leaf: game title, typed/penciled onto the page. */}
        <div style={{ ...zoneStyle(TITLE_ZONE), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2%" }}>
          <div style={{ fontFamily: t.fontBody, fontSize: "clamp(7px,1vw,10px)", letterSpacing: "2.5px", color: t.muted }}>
            SURVIVAL MODE &middot; FIELD JOURNAL
          </div>
          <div
            style={{
              fontFamily: t.fontDisplay,
              color: t.ink,
              lineHeight: 0.92,
              letterSpacing: "1px",
              fontSize: "clamp(20px,4.2vw,46px)",
              textShadow: "1.5px 1.5px 0 rgba(198,40,40,.16)",
              marginTop: "6%",
              animation: "bdhFlick 6s ease-in-out infinite",
            }}
          >
            BLACK
            <br />
            DAWN
            <br />
            <span style={{ color: t.blood }}>HORIZON</span>
          </div>
          <div style={{ marginTop: "6%", fontFamily: t.fontHand, fontSize: "clamp(11px,1.7vw,18px)", color: t.muted }}>
            &ldquo;How long would you survive?&rdquo;
          </div>
          {played > 0 && (
            <div style={{ marginTop: "auto", paddingTop: "6%", fontFamily: t.fontBody, fontSize: "clamp(7px,0.95vw,10px)", letterSpacing: "1.5px", color: t.muted }}>
              BEST {best} DAYS &middot; {played} RUN{played === 1 ? "" : "S"}
            </div>
          )}
        </div>

        {/* Left page, four taped strips: primary nav, one action per strip. */}
        <button className="bdh-strip-btn" style={stripStyle(STRIP_ZONES[0])} onClick={onPlay}>
          <span style={{ fontFamily: t.fontBody, fontWeight: "bold", fontSize: "clamp(11px,1.8vw,19px)", letterSpacing: "3px", color: t.ink }}>BEGIN</span>
        </button>
        <button className="bdh-strip-btn" style={stripStyle(STRIP_ZONES[1])} onClick={onTabLeader}>
          <span style={{ fontFamily: t.fontBody, fontSize: "clamp(9px,1.35vw,14px)", letterSpacing: "2px", color: "#2a2620" }}>LEADERBOARD</span>
        </button>
        <button className="bdh-strip-btn" style={stripStyle(STRIP_ZONES[2])} onClick={onTabAch}>
          <span style={{ fontFamily: t.fontBody, fontSize: "clamp(9px,1.35vw,14px)", letterSpacing: "2px", color: "#2a2620" }}>ACHIEVEMENTS</span>
        </button>
        <button className="bdh-strip-btn" style={stripStyle(STRIP_ZONES[3])} onClick={onTabEndings}>
          <span style={{ fontFamily: t.fontBody, fontSize: "clamp(9px,1.35vw,14px)", letterSpacing: "2px", color: "#2a2620" }}>ENDINGS</span>
        </button>

        {/* Right page, top-left scrap: cycling field-note tips. The polaroid
            and the pencil sketch beside/below it are permanent artwork —
            deliberately left untouched, no overlay anywhere near them. */}
        <div style={{ ...zoneStyle(TIPS_ZONE), padding: "5% 6%", transform: "rotate(-2.5deg)" }}>
          <SurvivalTips />
        </div>

        {/* Right page, bottom torn scrap: running survival journal recap. */}
        <div style={{ ...zoneStyle(JOURNAL_ZONE), padding: "5% 6%", display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: t.fontBody, fontSize: "clamp(8px,1.1vw,11px)", letterSpacing: "1.5px", color: t.muted, marginBottom: "4%" }}>
            SURVIVAL JOURNAL
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3%", overflow: "hidden" }}>
            {lines.map((line, i) => (
              <p key={i} style={{ margin: 0, fontFamily: t.fontHand, fontSize: "clamp(12px,1.7vw,17px)", lineHeight: 1.2, color: "#2a2013" }}>
                — {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
