import * as t from "../styles/tokens.js";
import { ACH } from "../data/achievements.js";
import { ENDINGS } from "../data/endings.js";

// Percentage-of-image bounding boxes, hand-measured against the notebook
// artwork's 1024x682 pixel grid (public/notebook-home.jpg) via cropped,
// upscaled, finely-gridded reference renders — not eyeballed off the full
// image, which is how the first pass under-measured the taped-strip stack
// and left the real fourth strip (under "ENDINGS") with no button on it at
// all. Every overlay below reads from this table, so re-tuning a zone
// against the art only ever means editing one number here.
// left/width widened vs. the first measurement — the flex-centered title
// text was landing left-heavy in its box because the box itself was too
// narrow (true paper right edge sits further right than first measured).
const TITLE_ZONE = { left: 9.5, top: 10.5, width: 35, height: 37.5 };
// Shifted right vs. the first measurement (button hit-area was sitting too
// far toward the ring binding relative to where the paper itself sits).
const STRIP_LEFT = 14.5;
const STRIP_WIDTH = 26.5;
const STRIP_ZONES = [
  { top: 51.3, height: 8.1 }, // taped strip 1 (y 345-400) - BEGIN
  { top: 60.8, height: 6.6 }, // taped strip 2 (y 410-455) - LEADERBOARD
  { top: 68.5, height: 8.7 }, // taped strip 3 (y 463-522) - ACHIEVEMENTS
  { top: 77.0, height: 10.3 }, // taped strip 4 (y 530-600) - ENDINGS
];
// Per-strip tilt re-measured against each strip's actual tape corners (the
// torn paper edges are too irregular to read reliably) — strips 1, 3, 4 all
// lift on the right (negative/counter-clockwise), strip 2 (the one strip
// with no tape, torn edges only) dips slightly the other way. The earlier
// pass had ENDINGS' sign backwards entirely.
const STRIP_TILT = [-2.5, 1.8, -3, -2];
const TITLE_TILT = -0.6;
const TIPS_ZONE = { left: 57.6, top: 15.3 };
// Narrowed 15%+ from its first measurement and given a hard right padding —
// the recap text was reaching the paper's torn right edge before wrapping.
const JOURNAL_ZONE = { left: 59.6, top: 66.5, width: 22.0, height: 22.7 };

// Solid dark charcoal (not pure #000, not multiply-blended) for anything
// that isn't the display title — multiply was washing out small body text
// to the point of illegibility against this much paper texture.
const INK_SOLID = "#14100c";
const inkSolid = { color: INK_SOLID, opacity: 0.92, textShadow: "0px 1px 0px rgba(255,255,255,.15)" };
// The title keeps multiply (it's large/bold enough to survive the blend)
// with a deep crimson red instead of the brighter blood-red used elsewhere.
const CRIMSON = "#8b0000";

function zoneStyle(z) {
  return { position: "absolute", left: `${z.left}%`, top: `${z.top}%`, width: `${z.width}%`, height: `${z.height}%` };
}

function stripStyle(z, tilt) {
  return { ...zoneStyle({ left: STRIP_LEFT, width: STRIP_WIDTH, top: z.top, height: z.height }), transform: `rotate(${tilt}deg)` };
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

        {/* Left page, large blank leaf: game title, typed/penciled onto the
            page. flex-start + fixed gaps (not centered/auto-margin) so the
            block's height never depends on whether the best/played line is
            present. */}
        <div style={{ ...zoneStyle(TITLE_ZONE), transform: `rotate(${TITLE_TILT}deg)`, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "3% 4% 0" }}>
          <div
            style={{
              mixBlendMode: "multiply",
              fontFamily: t.fontDisplay,
              color: INK_SOLID,
              lineHeight: 0.92,
              letterSpacing: "1px",
              fontSize: "clamp(26px,5.2vw,54px)",
              textShadow: "1.5px 1.5px 0 rgba(139,0,0,.22), 0 1px 0 rgba(255,255,255,.25)",
              marginTop: "4%",
              animation: "bdhFlick 6s ease-in-out infinite",
            }}
          >
            BLACK
            <br />
            DAWN
            <br />
            <span style={{ color: CRIMSON }}>HORIZON</span>
          </div>
          {/* margin-bottom (not just marginTop) so this line keeps real
              breathing room below it regardless of the flex spacer beneath —
              it was reading as crowded against the BEGIN strip. */}
          <div style={{ ...inkSolid, marginTop: "7%", marginBottom: "25px", fontFamily: t.fontHand, fontSize: "clamp(11px,1.6vw,17px)" }}>
            &ldquo;How long would you survive?&rdquo;
          </div>
          <div style={{ flex: 1 }} />
          {played > 0 && (
            <div style={{ ...inkSolid, paddingBottom: "4%", fontFamily: t.fontBody, fontSize: "clamp(7px,0.95vw,10px)", letterSpacing: "1.5px" }}>
              BEST {best} DAYS &middot; {played} RUN{played === 1 ? "" : "S"}
            </div>
          )}
        </div>

        {/* Left page, four taped strips: primary nav, one action per strip. */}
        <button className="bdh-strip-btn" style={stripStyle(STRIP_ZONES[0], STRIP_TILT[0])} onClick={onPlay}>
          <span style={{ ...inkSolid, fontFamily: t.fontBody, fontWeight: "bold", fontSize: "clamp(14px,2.3vw,24px)", letterSpacing: "4px" }}>BEGIN</span>
        </button>
        <button className="bdh-strip-btn" style={stripStyle(STRIP_ZONES[1], STRIP_TILT[1])} onClick={onTabLeader}>
          <span style={{ ...inkSolid, fontFamily: t.fontBody, fontSize: "clamp(11px,1.7vw,18px)", letterSpacing: "1.5px" }}>LEADERBOARD</span>
        </button>
        <button className="bdh-strip-btn" style={stripStyle(STRIP_ZONES[2], STRIP_TILT[2])} onClick={onTabAch}>
          <span style={{ ...inkSolid, fontFamily: t.fontBody, fontSize: "clamp(11px,1.7vw,18px)", letterSpacing: "1.5px" }}>ACHIEVEMENTS</span>
        </button>
        <button className="bdh-strip-btn" style={stripStyle(STRIP_ZONES[3], STRIP_TILT[3])} onClick={onTabEndings}>
          <span style={{ ...inkSolid, fontFamily: t.fontBody, fontSize: "clamp(13px,2vw,21px)", letterSpacing: "3px" }}>ENDINGS</span>
        </button>

        {/* Right page, top-left scrap: static sticky-note tip. Fixed
            max-width (not a percentage zone) per spec, so it reads as a
            small taped note rather than stretching to fill its region. The
            polaroid and the pencil sketch elsewhere on this page are
            permanent artwork — deliberately left untouched. */}
        <div
          style={{
            position: "absolute",
            left: `${TIPS_ZONE.left}%`,
            top: `${TIPS_ZONE.top}%`,
            maxWidth: "180px",
            padding: "10px",
            overflowWrap: "break-word",
            textAlign: "center",
            transform: "rotate(3deg)",
            boxSizing: "border-box",
          }}
        >
          <div style={{ ...inkSolid, fontFamily: t.fontBody, fontWeight: "bold", fontSize: "clamp(10px,1.3vw,13px)", letterSpacing: ".5px" }}>SURVIVAL TIP #1:</div>
          <p style={{ ...inkSolid, margin: "8px 0 0", fontFamily: t.fontBody, fontSize: "clamp(10px,1.3vw,13px)", lineHeight: 1.4 }}>
            Trust is a currency out here. Spend it wisely.
          </p>
        </div>

        {/* Right page, bottom torn scrap: running survival journal recap. */}
        <div style={{ ...zoneStyle(JOURNAL_ZONE), padding: "5%", paddingRight: "20px", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box" }}>
          <div style={{ ...inkSolid, fontFamily: t.fontBody, fontSize: "clamp(11px,1.5vw,15px)", letterSpacing: "1.5px", marginBottom: "4%" }}>SURVIVAL JOURNAL</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3%", overflow: "hidden" }}>
            {lines.map((line, i) => (
              <p
                key={i}
                style={{
                  ...inkSolid,
                  margin: 0,
                  maxWidth: "100%",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  fontFamily: t.fontHand,
                  fontSize: "clamp(15px,2.1vw,21px)",
                  lineHeight: 1.3,
                }}
              >
                — {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
