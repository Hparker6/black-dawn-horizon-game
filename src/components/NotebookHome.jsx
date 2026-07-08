import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as t from "../styles/tokens.js";
import { ACH } from "../data/achievements.js";
import { ENDINGS } from "../data/endings.js";
import SurvivalTip from "./SurvivalTip.jsx";

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
const TITLE_ZONE = { left: 11.3, top: 10.5, width: 35, height: 37.5 };
// Shifted right vs. the first measurement (button hit-area was sitting too
// far toward the ring binding relative to where the paper itself sits).
const STRIP_LEFT = 14.5;
const STRIP_WIDTH = 26.5;
// Re-measured by sampling the source JPG's actual pixel luminance (row-
// averaged across the strip's x-band, to cancel out text-stroke and tape
// noise) rather than eyeballing a gridded screenshot — the hand-measured
// pass still had each zone noticeably taller than the real paper and
// vertically offset from it, which is what put the flex-centered label off
// the visible strip (BEGIN sitting high, ACHIEVEMENTS sitting low, etc).
// +2 to every top vs. the raw pixel measurement above: the rising-edge scan
// that produced those numbers was catching the TAPE's top edge (brighter
// than the page background) rather than the paper's own top edge, which
// sits a little below the tape corners — that consistent bias is what put
// the flex-centered label high on all four strips even after the
// measurement fix.
const STRIP_ZONES = [
  { top: 50.9, height: 8.6 }, // taped strip 1 (y 341-399) - BEGIN
  { top: 60.2, height: 8.1 }, // taped strip 2 (y 404-459) - LEADERBOARD
  { top: 68.9, height: 8.2 }, // taped strip 3 (y 463-519) - ACHIEVEMENTS
  { top: 78.6, height: 7.7 }, // taped strip 4 (y 530-582) - ENDINGS
];
// Re-measured from the same pixel data: the falling edge of each strip's
// bottom border, sampled at 7 x-positions across its width and fit for
// slope. The hand-measured pass had strips 1, 2, and 4 tilting the wrong
// direction entirely (and strip 3 tilting the right way but ~2x too far) —
// the source art's tilts are all under 2 degrees, not the 2-3 degrees
// previously coded.
const STRIP_TILT = [0.5, -0.9, -1.6, 0.7];
const TITLE_TILT = -0.6;
const TIPS_ZONE = { left: 58.3, top: 16.5 };
// Narrowed 15%+ from its first measurement and given a hard right padding —
// the recap text was reaching the paper's torn right edge before wrapping.
// top raised 4 points from its first measurement — it was sitting low
// enough to crowd the bottom torn edge of its own scrap.
const JOURNAL_ZONE = { left: 59.6, top: 62.5, width: 22.0, height: 22.7 };

// --- Responsive scaling ---------------------------------------------------
// The zones above are percentages of the artwork, so POSITION already
// survives any container size — what broke on phones/small monitors was
// TYPE: fonts were clamp()ed against the *viewport* with px floors, so when
// the notebook shrank the text didn't, and the title block spilled down
// into the BEGIN strip while strip labels outgrew their strips.
//
// Fix: all type + px spacing is specified in "artwork pixels" (the same
// 1024x682 grid the zones were measured on) and multiplied by the
// container's live scale factor, so text shrinks and grows in lockstep with
// the paper it sits on. Values are matched to how the spread rendered at
// its 1150px desktop cap before this pass, so desktop looks unchanged.
//
// Below STACK_BREAKPOINT the two-page spread is physically too small for
// proportional type to help (strip labels would land around 7px on a
// portrait phone), so the component switches to a stacked layout: the same
// artwork cropped to its left and right page halves, one above the other,
// each near full-width. Each page then renders ~2x larger without touching
// the zone table — its percentages just get remapped from spread-space to
// half-page space (x2 horizontally, y unchanged).
const STACK_BREAKPOINT = 640;

const TYPE = {
  title: 48,
  tagline: 19,
  taglineGap: 22, // breathing room under the tagline, above BEGIN
  tip: 12,
  tipMaxWidth: 160,
  journalHead: 13,
  journalHeadLs: 1.3,
  journalLine: 16,
  journalPadRight: 18,
};

// Per-strip label sizing (artwork px). The two long words share a smaller
// size than BEGIN/ENDINGS, same hierarchy as before. floors keep the labels
// from dipping below legibility at the narrowest sizes each mode allows.
const STRIP_LABELS = [
  { label: "BEGIN", size: 21, ls: 3.5, floor: 12 },
  { label: "LEADERBOARD", size: 16, ls: 1.3, floor: 10 },
  { label: "ACHIEVEMENTS", size: 16, ls: 1.3, floor: 10 },
  { label: "ENDINGS", size: 19, ls: 2.6, floor: 11 },
];

const IMG_ALT = "A weathered field journal, open to its first page.";

// Solid dark charcoal (not pure #000, not multiply-blended) for anything
// that isn't the display title — multiply was washing out small body text
// to the point of illegibility against this much paper texture.
const INK_SOLID = "#14100c";
const inkSolid = { color: INK_SOLID, opacity: 0.92, textShadow: "0px 1px 0px rgba(255,255,255,.15)" };
// The title keeps multiply (it's large/bold enough to survive the blend)
// with a deep crimson red instead of the brighter blood-red used elsewhere.
const CRIMSON = "#8b0000";

function zoneStyle(z) {
  return {
    position: "absolute",
    left: `${z.left}%`,
    top: `${z.top}%`,
    width: z.width != null ? `${z.width}%` : undefined,
    height: z.height != null ? `${z.height}%` : undefined,
  };
}

// Remaps a spread-space zone (percentages of the full-width artwork) into
// half-page space (percentages of a 512px-wide crop): x doubles, y is
// untouched because the crop keeps the artwork's full height.
function toHalf(side) {
  return (z) => ({
    ...z,
    left: side === "left" ? z.left * 2 : (z.left - 50) * 2,
    width: z.width != null ? z.width * 2 : undefined,
  });
}
const identity = (z) => z;

function useStackedLayout() {
  const [stacked, setStacked] = useState(
    () => window.matchMedia(`(max-width: ${STACK_BREAKPOINT - 1}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${STACK_BREAKPOINT - 1}px)`);
    const onChange = (e) => setStacked(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return stacked;
}

// Live px-per-artwork-px scale of whichever container `ref` is attached to.
// In spread mode the container spans the full 1024-grid; in stacked mode it
// spans one 512-wide page half.
function useArtScale(stacked) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stacked]);
  return { ref, scale: width / (stacked ? 512 : 1024) };
}

// One cropped page half for the stacked layout: the full artwork rendered
// at 200% width inside an overflow-hidden frame, shifted left for the
// right-hand page. objectFit behavior matches the spread's (the frame keeps
// the artwork's own aspect, so "fill" introduces no distortion).
function PageHalf({ side, children }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "512 / 682", overflow: "hidden" }}>
      <img
        src="/notebook-home.jpg"
        alt={side === "left" ? IMG_ALT : ""}
        aria-hidden={side === "right" || undefined}
        style={{
          position: "absolute",
          top: 0,
          left: side === "left" ? 0 : "-100%",
          width: "200%",
          height: "100%",
          objectFit: "fill",
          userSelect: "none",
          pointerEvents: "none",
        }}
        draggable={false}
      />
      {children}
    </div>
  );
}

// Nav-strip label text: bold and fully opaque (not inkSolid's 0.92) with a
// tighter, darker shadow than inkSolid's — inkSolid's faint 1px highlight
// was tuned for body copy sitting on uniformly light paper, but these labels
// sit on four strips of visibly different tone (ACHIEVEMENTS' tan paper is
// noticeably darker than the others), and regular-weight type on top of the
// distressed typewriter font's own built-in texture was reading as faded on
// every strip, not just that one. Bold + full opacity + a firmer shadow
// fixes contrast without changing color, tape, or layout.
function stripLabelStyle(fontSize, letterSpacing) {
  return {
    color: INK_SOLID,
    opacity: 1,
    textShadow: "0 1px 1px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.2)",
    fontFamily: t.fontBody,
    fontWeight: 700,
    fontSize,
    letterSpacing,
  };
}

// Recap lines for the bottom-right "survival journal" scrap — a running
// summary derived from whatever the save file already tracks (best/played/
// achievements/endings), not a separate per-run history log. Framed as
// journal entries so it reads as the character's own hand, not a stats
// panel.
//
// Capped at 3 lines (2 for the empty state): the scrap is a fixed torn-paper
// zone hand-measured against the artwork, not a growable panel, and at the
// hand font's legible size it only ever has room for ~3 short lines before
// overflow:hidden starts eating them. Medals + endings share one line
// (rather than one line each, the original 4-line version) to stay inside
// that budget without dropping the information.
function journalLines({ best, played, ach, endingsFound }) {
  if (!played) {
    return ["No entries yet.", "The road is still ahead of you."];
  }
  const lines = [`${played} run${played === 1 ? "" : "s"} logged so far.`];
  if (best > 0) lines.push(`Best run: ${best} day${best === 1 ? "" : "s"}.`);
  lines.push(`${ach.length}/${ACH.length} medals, ${endingsFound.length}/${ENDINGS.length} endings.`);
  return lines;
}

export default function NotebookHome({ best, played, ach, endingsFound, onPlay, onTabLeader, onTabAch, onTabEndings }) {
  const lines = journalLines({ best, played, ach, endingsFound });
  const stacked = useStackedLayout();
  const { ref, scale } = useArtScale(stacked);
  // Artwork-px -> rendered-px. The floor only matters at the smallest sizes
  // each mode allows; everywhere else text tracks the paper exactly.
  const px = (n, floor = 0) => `${Math.max(floor, n * scale)}px`;

  const stripActions = [onPlay, onTabLeader, onTabAch, onTabEndings];

  // Left page, large blank leaf: game title, typed/penciled onto the page,
  // plus the four taped strips of primary nav (one action per strip).
  // flex-start + fixed gaps (not centered/auto-margin) on the title block so
  // its height never depends on whether the best/played line is present.
  const leftPage = (m) => (
    <>
      <div style={{ ...zoneStyle(m(TITLE_ZONE)), transform: `rotate(${TITLE_TILT}deg)`, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "3% 4% 0" }}>
        <div
          style={{
            mixBlendMode: "multiply",
            fontFamily: t.fontDisplay,
            color: INK_SOLID,
            lineHeight: 0.92,
            letterSpacing: "1px",
            fontSize: px(TYPE.title, 20),
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
        <div style={{ ...inkSolid, marginTop: "7%", marginBottom: px(TYPE.taglineGap), fontFamily: t.fontHand, fontWeight: 700, fontSize: px(TYPE.tagline, 11), letterSpacing: ".3px" }}>
          &ldquo;How long would you survive?&rdquo;
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {STRIP_LABELS.map((s, i) => (
        <button
          key={s.label}
          className="bdh-strip-btn"
          style={{
            ...zoneStyle(m({ left: STRIP_LEFT, width: STRIP_WIDTH, top: STRIP_ZONES[i].top, height: STRIP_ZONES[i].height })),
            transform: `rotate(${STRIP_TILT[i]}deg)`,
          }}
          onClick={stripActions[i]}
        >
          <span style={stripLabelStyle(px(s.size, s.floor), px(s.ls))}>{s.label}</span>
        </button>
      ))}
    </>
  );

  const rightPage = (m) => {
    const tips = m(TIPS_ZONE);
    return (
      <>
        {/* Right page, top-left scrap: cycling sticky-note tip (see
            SurvivalTip.jsx). Scaled max-width (not a percentage zone) per
            spec, so it reads as a small taped note rather than stretching
            to fill its region — and has no fixed height, since tip length
            varies and this scrap should grow to fit rather than clip (see
            the journal recap below for what happens when a zone can't). The
            polaroid and the pencil sketch elsewhere on this page are
            permanent artwork — deliberately left untouched. */}
        <div
          style={{
            position: "absolute",
            left: `${tips.left}%`,
            top: `${tips.top}%`,
            maxWidth: px(TYPE.tipMaxWidth, 110),
            padding: "10px",
            overflowWrap: "break-word",
            textAlign: "center",
            transform: "rotate(3deg)",
            boxSizing: "border-box",
          }}
        >
          <SurvivalTip fontSize={px(TYPE.tip, 10)} />
        </div>

        {/* Right page, bottom torn scrap: running survival journal recap.
            flexShrink:0 on both the header and the line-list below makes the
            OUTER zone's overflow:hidden the only clipping boundary — without
            it, a flex column silently squeezes overflow:hidden children
            toward zero height instead of just clipping their tail, which is
            how a single overlong line once collapsed the whole recap down to
            a sliver (see journalLines' comment on the line-count budget). */}
        <div style={{ ...zoneStyle(m(JOURNAL_ZONE)), padding: "5%", paddingRight: px(TYPE.journalPadRight, 12), display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box" }}>
          <div style={{ ...inkSolid, flexShrink: 0, fontFamily: t.fontBody, fontSize: px(TYPE.journalHead, 9), letterSpacing: px(TYPE.journalHeadLs), marginBottom: "4%" }}>SURVIVAL JOURNAL</div>
          <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, gap: "3%", overflow: "hidden" }}>
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
                  fontSize: px(TYPE.journalLine, 11),
                  lineHeight: 1.3,
                }}
              >
                — {line}
              </p>
            ))}
          </div>
        </div>
      </>
    );
  };

  if (stacked) {
    // Portrait phones: the two page halves stacked, capped so a landscape
    // phone that trips the breakpoint doesn't render them enormous. The
    // page pair is taller than most phone viewports — that's fine, the
    // screen scrolls like the rest of the app.
    return (
      <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "6px 0" }}>
        <div ref={ref} style={{ width: "min(100%, 480px)", display: "flex", flexDirection: "column", gap: "10px", animation: "bdhFadeUp .5s ease both" }}>
          <PageHalf side="left">{leftPage(toHalf("left"))}</PageHalf>
          <PageHalf side="right">{rightPage(toHalf("right"))}</PageHalf>
        </div>
      </div>
    );
  }

  // Width is normally height-fit (86vh at the artwork's aspect) so the whole
  // spread sits in view; the max() keeps a short-but-wide window (landscape
  // phone, half-height desktop window) from crushing it below 640px — past
  // that point legible type matters more than fitting vertically, and the
  // page scrolls instead.
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "6px 0" }}>
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "min(100%, 1150px, max(640px, calc(86vh * 1024 / 682)))",
          aspectRatio: "1024 / 682",
          animation: "bdhFadeUp .5s ease both",
        }}
      >
        <img
          src="/notebook-home.jpg"
          alt={IMG_ALT}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", userSelect: "none", pointerEvents: "none" }}
          draggable={false}
        />
        {leftPage(identity)}
        {rightPage(identity)}
      </div>
    </div>
  );
}
