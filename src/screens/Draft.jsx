import { useEffect, useState } from "react";
import * as t from "../styles/tokens.js";
import { SURVIVOR_SLOTS, TRAIT_LABELS } from "../data/survivor.js";
import JackpotConfetti from "../components/JackpotConfetti.jsx";

// The Survivor Identity draft, back on the slot machine: each of the three
// journal pages (THE WEAPON / THE COMPANION / THE KEEPSAKE) ROLLS four
// random pieces from its pool of eight — cycling faces, staggered settles,
// rarity glows, the works — and the player picks one of what fate offered.
// One respin is shared across the whole playthrough (3 rolls minimum, 4
// max), so luck is real but never unfixable. Rarity is a visual axis only:
// no piece carries stats, and the jackpot pull is the dream pull because of
// who it is, not what it adds.
//
// Round-to-round transition is the same quiet fade-up the lore pages use —
// no page-flip.

// Shared by the real cards and the idle-phase ghost placeholders so the
// ROLL button's preview matches the size of what's about to land.
const GRID_CARD_MIN_HEIGHT = "236px";
const GRID_MAX_WIDTH = "680px";

// Shuffle timing: fast cycling through the pool, then each of the 4 slots
// stops one at a time (staggered) so the deceleration reads as a
// slot-machine landing rather than all 4 snapping at once. Settle times
// must land before App.jsx's ROLL_DELAY_MS flips phase to "revealed".
const CYCLE_TICK_MS = 80;
const SETTLE_AT_MS = [650, 830, 1010, 1190];
const CYCLE_TICK_MS_REDUCED = 70;
const SETTLE_AT_MS_REDUCED = [60, 110, 160, 210];
const CELEBRATE_MS = 900;

// Settle-pop + idle-glow animation names, scaled by rarity (see the
// bdhSettle*/rarityGlow* keyframes in index.css).
const SETTLE_ANIM = {
  common: "bdhSettleCommon .3s cubic-bezier(.2,1.3,.4,1), rarityGlowCommon 3s ease-in-out infinite",
  rare: "bdhSettleRare .32s cubic-bezier(.2,1.3,.4,1), rarityGlowRare 2.6s ease-in-out infinite",
  ultra: "bdhSettleUltra .36s cubic-bezier(.2,1.3,.4,1), rarityGlowUltra 2.2s ease-in-out infinite",
  jackpot: "bdhSettleJackpot .42s cubic-bezier(.2,1.3,.4,1), rarityGlowJackpot 3.4s linear infinite",
};

function randomCard(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function gridStyle() {
  return { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxWidth: GRID_MAX_WIDTH, width: "100%", margin: "0 auto" };
}

// Rarity is a visual axis only — border/background color and glow intensity
// scale with tier, nothing else does.
function cardStyle(picked, pending, rarity) {
  const rc = t.rarityColors(rarity);
  return {
    position: "relative",
    textAlign: "center",
    cursor: picked ? "default" : "pointer",
    borderRadius: "3px",
    padding: "12px 12px 10px",
    fontFamily: t.fontBody,
    border: "1px solid " + (picked ? t.blood : rc.border),
    background: picked ? t.pickedBg : rc.bg,
    boxShadow: picked ? "0 0 0 2px #c62828 inset" : "0 2px 6px -3px rgba(0,0,0,.25)",
    transition: "transform .15s, box-shadow .15s",
    opacity: pending && !picked ? 0.35 : 1,
    overflow: "hidden",
    minHeight: GRID_CARD_MIN_HEIGHT,
  };
}

function rarityBadge(rarity) {
  if (rarity === "common") return null; // common uses the dog-ear fold instead of a badge
  const rc = t.rarityColors(rarity);
  const style = {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    zIndex: 1,
    border: `1.5px solid ${rc.border}`,
    color: rc.text,
    background: rc.bg,
  };
  const icon = rarity === "jackpot" ? "★" : rarity === "ultra" ? "◆" : "✦";
  return { style, icon };
}

// Idle-phase filler: four dashed placeholder slots the same size/shape as
// the cards about to land. Purely decorative.
function GhostSlots() {
  return (
    <div style={gridStyle()}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ minHeight: GRID_CARD_MIN_HEIGHT, borderRadius: "3px", border: `1px dashed ${t.borderDashed}`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

function SketchArt({ art, image }) {
  // Illustrated plates (data/survivor.js `image`) render in place of the SVG
  // sketch; the sketch stays as the fallback if the file is missing or fails
  // to load, so a settled card is never blank.
  const [broken, setBroken] = useState(false);
  if (image && !broken) {
    return (
      <img
        src={image}
        alt=""
        aria-hidden="true"
        onError={() => setBroken(true)}
        style={{
          width: "100%",
          height: "116px",
          objectFit: "cover",
          display: "block",
          margin: "2px 0 0",
          borderRadius: "2px",
          border: "1px solid rgba(42,38,32,.28)",
          boxSizing: "border-box",
        }}
      />
    );
  }
  return (
    <svg viewBox="0 0 64 64" style={{ width: "100%", height: "82px", display: "block", margin: "2px 0 0" }} aria-hidden="true">
      <g
        fill="none"
        stroke="#2a2620"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        // Static, local sketch markup from data/survivor.js — never
        // user-supplied.
        dangerouslySetInnerHTML={{ __html: art }}
      />
    </svg>
  );
}

export default function Draft({ round, respins, phase, cards, pickedId, reduceMotion, onRoll, onReroll, onPickCard }) {
  const slot = SURVIVOR_SLOTS[round];
  const idle = phase === "idle";
  const active = phase === "rolling" || phase === "revealed";
  const revealed = phase === "revealed";
  const canReroll = revealed && respins > 0 && !pickedId;

  const [faces, setFaces] = useState([null, null, null, null]);
  const [settled, setSettled] = useState([false, false, false, false]);
  const [celebrate, setCelebrate] = useState([false, false, false, false]);

  // Warm the browser cache for every illustrated plate the moment the draft
  // opens, so a card never settles before its artwork has arrived — the
  // slot-machine landing is the showcase moment and must not pop in.
  useEffect(() => {
    SURVIVOR_SLOTS.forEach((s) =>
      s.items.forEach((item) => {
        if (item.image) new Image().src = item.image;
      })
    );
  }, []);

  useEffect(() => {
    if (phase !== "rolling") return;
    const tickMs = reduceMotion ? CYCLE_TICK_MS_REDUCED : CYCLE_TICK_MS;
    const settleTimes = reduceMotion ? SETTLE_AT_MS_REDUCED : SETTLE_AT_MS;
    const pool = slot.items;

    setSettled([false, false, false, false]);
    setCelebrate([false, false, false, false]);
    setFaces([randomCard(pool), randomCard(pool), randomCard(pool), randomCard(pool)]);

    const intervals = [0, 1, 2, 3].map((i) =>
      setInterval(() => {
        setFaces((prev) => {
          const next = [...prev];
          next[i] = randomCard(pool);
          return next;
        });
      }, tickMs)
    );
    const celebrateTimeouts = [];
    const timeouts = settleTimes.map((delay, i) =>
      setTimeout(() => {
        clearInterval(intervals[i]);
        setFaces((prev) => {
          const next = [...prev];
          next[i] = cards[i];
          return next;
        });
        setSettled((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        // Jackpot gets its moment: a confetti burst the instant that slot
        // locks in, not just a bigger glow like the other tiers.
        if (cards[i] && cards[i].rarity === "jackpot") {
          setCelebrate((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          celebrateTimeouts.push(
            setTimeout(() => {
              setCelebrate((prev) => {
                const next = [...prev];
                next[i] = false;
                return next;
              });
            }, CELEBRATE_MS)
          );
        }
      }, delay)
    );

    return () => {
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
      celebrateTimeouts.forEach(clearTimeout);
    };
  }, [phase, slot, cards, reduceMotion]);

  return (
    // Keyed per round: each identity page fades up like the lore pages do.
    <div
      key={slot.key}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "20px 18px 20px",
        animation: "bdhFadeUp .4s ease both",
        backgroundImage: t.gameplayRuleBg,
        backgroundSize: t.journalRuleSize,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: t.muted }}>
          THE SURVIVOR — PAGE{" "}
          {SURVIVOR_SLOTS.map((s, i) => (
            <span key={s.key} style={{ color: i === round ? t.ink : t.borderSubtle, fontWeight: i === round ? 700 : 400 }}>
              {s.numeral}
              {i < SURVIVOR_SLOTS.length - 1 ? " · " : ""}
            </span>
          ))}
        </div>
        <div style={{ fontSize: "11px", letterSpacing: "1px", color: t.muted, textAlign: "right" }}>
          REROLL
          <br />
          <span style={{ fontSize: "19px", color: t.gold }}>◈ {respins}</span>
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "8px 0 14px" }}>
        {/* Each category's own header vignette (data/survivor.js `banner`). */}
        <svg viewBox="0 0 320 64" style={{ width: "min(340px, 80%)", display: "block", margin: "0 auto 4px", opacity: 0.82 }} aria-hidden="true">
          <g fill="none" stroke="#2a2620" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: slot.banner }} />
        </svg>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "34px", lineHeight: 1, letterSpacing: "1px", color: t.ink }}>{slot.title}</div>
        <div style={{ fontFamily: t.fontHand, fontWeight: 500, fontSize: "18px", color: t.muted, marginTop: "4px" }}>
          {slot.prompt} Roll for what fate hands over.
        </div>
      </div>

      {idle && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "22px", minHeight: 0 }}>
          <GhostSlots />
          <button
            onClick={onRoll}
            style={{
              width: "100%",
              maxWidth: GRID_MAX_WIDTH,
              border: "none",
              cursor: "pointer",
              background: t.gold,
              color: t.ribbonBg,
              fontFamily: t.fontBody,
              fontSize: "19px",
              letterSpacing: "3px",
              padding: "20px",
              borderRadius: "2px",
              boxShadow: "0 4px 0 #a8801f",
              animation: "bdhGlow 2.2s ease-in-out infinite",
            }}
          >
            ◈&nbsp; ROLL THE CRATE &nbsp;◈
          </button>
        </div>
      )}

      {active && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px", flex: 1, minHeight: 0 }}>
          <div data-noscroll="true" style={gridStyle()}>
            {[0, 1, 2, 3].map((i) => {
              // While rolling and not yet settled, show the cycling face from
              // the pool (name only — full detail would just blur past at
              // this tick rate). Once settled or revealed, the real card.
              const isSettled = revealed || settled[i];
              const displayCard = isSettled ? cards[i] : faces[i];
              if (!displayCard) return <div key={i} />;

              const picked = revealed && pickedId === displayCard.id;
              const rarity = displayCard.rarity || "common";
              const badge = isSettled ? rarityBadge(rarity) : null;
              const showDogEar = isSettled && rarity === "common";
              const showShimmer = isSettled && (rarity === "ultra" || rarity === "jackpot");
              const traitLine = (displayCard.traits || []).map((tr) => "✦ " + (TRAIT_LABELS[tr] || tr)).join("   ");

              return (
                <button
                  // Remount the instant a slot settles so its landing
                  // animation reliably (re)plays, without disturbing the
                  // other 3 still-cycling slots.
                  key={`${i}-${isSettled}`}
                  onClick={() => revealed && onPickCard(displayCard)}
                  style={{
                    ...cardStyle(picked, revealed && !!pickedId, rarity),
                    cursor: revealed && !pickedId ? "pointer" : "default",
                    animation: isSettled ? SETTLE_ANIM[rarity] : "bdhFlick .5s ease-in-out infinite",
                  }}
                >
                  {showShimmer && (
                    <span style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          width: "36%",
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)",
                          animation: `shimmerSweep ${rarity === "jackpot" ? "2.6s" : "3.6s"} ease-in-out infinite`,
                        }}
                      />
                    </span>
                  )}
                  {badge && <span style={badge.style}>{badge.icon}</span>}
                  {showDogEar && (
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "16px",
                        height: "16px",
                        background: "linear-gradient(135deg, transparent 50%, #f4efe4 50%)",
                        boxShadow: "-2px 2px 3px -1px rgba(0,0,0,.25)",
                        zIndex: 1,
                      }}
                    />
                  )}
                  {isSettled ? (
                    <div style={{ position: "relative", zIndex: 0, display: "flex", flexDirection: "column", height: "100%" }}>
                      <div style={{ fontSize: "9px", letterSpacing: "1.5px", color: t.rarityColors(rarity).text, textAlign: "left" }}>
                        {t.RARITY_LABEL[rarity]}
                      </div>
                      <SketchArt art={displayCard.art} image={displayCard.image} />
                      <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "1.2px", color: t.ink, marginTop: "8px" }}>
                        {displayCard.name.toUpperCase()}
                      </div>
                      <div style={{ fontFamily: t.fontHand, fontWeight: 500, fontSize: "15px", lineHeight: 1.25, color: t.muted, marginTop: "4px" }}>
                        {displayCard.line}
                      </div>
                      <div style={{ fontSize: "9px", letterSpacing: "1.5px", color: t.goldDark, marginTop: "auto", paddingTop: "7px", minHeight: "12px" }}>
                        {traitLine}
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: "relative", zIndex: 0, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <div style={{ fontSize: "14px", color: t.rankMuted, letterSpacing: ".3px", textAlign: "center" }}>{displayCard.name}</div>
                    </div>
                  )}
                  {picked && (
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%) rotate(-11deg)",
                        fontFamily: t.fontDisplay,
                        fontSize: "28px",
                        color: t.blood,
                        border: `3px solid ${t.blood}`,
                        padding: "2px 12px",
                        borderRadius: "4px",
                        opacity: 0.9,
                        zIndex: 2,
                        animation: "bdhStamp .5s cubic-bezier(.2,1.3,.4,1) both",
                        whiteSpace: "nowrap",
                      }}
                    >
                      TAKEN
                    </span>
                  )}
                  {celebrate[i] && <JackpotConfetti />}
                </button>
              );
            })}
          </div>
          {canReroll && (
            <button
              onClick={onReroll}
              style={{
                width: "100%",
                maxWidth: GRID_MAX_WIDTH,
                margin: "0 auto",
                border: `1px solid ${t.gold}`,
                cursor: "pointer",
                background: t.highlightBg,
                color: t.highlightText,
                fontFamily: t.fontBody,
                fontSize: "12px",
                letterSpacing: "2px",
                padding: "11px",
                borderRadius: "2px",
                flexShrink: 0,
              }}
            >
              ⟳ REROLL THESE 4 &middot; {respins} LEFT
            </button>
          )}
        </div>
      )}
    </div>
  );
}
