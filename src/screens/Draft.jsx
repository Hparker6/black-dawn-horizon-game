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

// Card geometry, shared by the real cards, the idle-phase ghost
// placeholders, and the cycling (mid-roll) faces so nothing jumps when a
// slot settles. Card min-height derives from the slot's own art window:
// art height (vh-capped so two rows + header + reroll still fit a short
// laptop screen) plus the text block. The text block is deliberately
// tight — the art gets the vertical room, the text doesn't.
const CARD_TEXT_BLOCK = "112px";
const CARD_WIDTH = "min(354px, 50vw - 18px)";
const ART_MAX_HEIGHT = "20vh";
const GRID_MAX_WIDTH = "720px";
function cardMinHeight(artRatioNum) {
  return `calc(min(${CARD_WIDTH} / ${artRatioNum.toFixed(3)}, ${ART_MAX_HEIGHT}) + ${CARD_TEXT_BLOCK})`;
}
// The illustrated plate: full-bleed to the card edges and the dominant
// element of the card. The aspect window comes from the slot's `artRatio`
// (native for weapon plates, a tall portrait crop for companions), the
// height cap from the slot's layout.
const ART_STYLE = {
  width: "100%",
  minHeight: "92px",
  objectFit: "cover",
  display: "block",
};

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

// Rarity is a visual axis only, but the ladder should be readable at a
// glance the way collectible card games do it: commons sit on duller,
// grayer paper with muted art; rare adds gold foil corners on brighter
// parchment; ultra gets a purple double frame and a wax seal; jackpot gets
// its own heavy gold frame, seal, spotlight, and rising embers. None of it
// changes what a card does.
function cardStyle(picked, pending, rarity, minHeight) {
  const rc = t.rarityColors(rarity);
  const common = rarity === "common";
  const heavyFrame = rarity === "ultra" || rarity === "jackpot";
  return {
    position: "relative",
    textAlign: "center",
    cursor: picked ? "default" : "pointer",
    borderRadius: "3px",
    padding: 0,
    fontFamily: t.fontBody,
    border: `${heavyFrame ? "2px" : "1px"} solid ` + (picked ? t.blood : rc.border),
    background: picked ? t.pickedBg : common ? t.commonBg : t.rareBg,
    boxShadow: picked ? "0 0 0 2px #c62828 inset" : "0 2px 6px -3px rgba(0,0,0,.25)",
    transition: "transform .15s, box-shadow .15s, filter .15s",
    opacity: pending && !picked ? 0.35 : 1,
    overflow: "hidden",
    minHeight,
  };
}

// Rare's "gold foil" photo-mount corners. A separate element (not
// box-shadow) because the rarityGlow* animations own the card's
// box-shadow.
function FoilCorners() {
  const base = { position: "absolute", width: "13px", height: "13px", zIndex: 2, pointerEvents: "none" };
  const b = `2px solid ${t.rareBorder}`;
  return (
    <>
      <span style={{ ...base, top: "4px", left: "4px", borderTop: b, borderLeft: b }} />
      <span style={{ ...base, top: "4px", right: "4px", borderTop: b, borderRight: b }} />
      <span style={{ ...base, bottom: "4px", left: "4px", borderBottom: b, borderLeft: b }} />
      <span style={{ ...base, bottom: "4px", right: "4px", borderBottom: b, borderRight: b }} />
    </>
  );
}

// Ultra/jackpot inner rule — reads as a decorative double frame with the
// outer border. Also an element rather than box-shadow, same reason as
// FoilCorners.
function InnerFrame({ rarity }) {
  return (
    <span
      style={{
        position: "absolute",
        inset: "3px",
        border: `1px solid ${t.rarityColors(rarity).border}`,
        borderRadius: "2px",
        opacity: 0.65,
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  );
}

// Jackpot's rising embers: a handful of glowing motes drifting up the card,
// looping. Skipped entirely under reduced motion.
const EMBER_COLORS = ["#e8b64e", "#d4763b", "#e8b64e", "#c62828", "#e8b64e", "#d4763b"];
function Embers() {
  return (
    <span style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }} aria-hidden="true">
      {EMBER_COLORS.map((color, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            bottom: "6px",
            left: `${8 + i * 15}%`,
            width: i % 2 ? "3px" : "4px",
            height: i % 2 ? "3px" : "4px",
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 6px 1px ${color}`,
            opacity: 0,
            "--ex": `${(i % 3) * 8 - 8}px`,
            animation: `bdhEmberRise ${2.2 + (i % 3) * 0.4}s ease-out ${i * 0.45}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

// Small tier tag overlaid on the artwork's top-left corner — replaces the
// old 9px label that sat in the card body and was nearly invisible.
function rarityTagStyle(rarity) {
  const rc = t.rarityColors(rarity);
  return {
    position: "absolute",
    top: "7px",
    left: "7px",
    zIndex: 1,
    fontSize: "9px",
    letterSpacing: "1.5px",
    padding: "3px 7px 2px",
    borderRadius: "2px",
    border: `1px solid ${rc.border}`,
    color: rc.text,
    background: "rgba(250,246,236,.88)",
  };
}

function rarityBadge(rarity) {
  if (rarity === "common") return null; // common uses the dog-ear fold instead of a badge
  const rc = t.rarityColors(rarity);
  const base = {
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
    zIndex: 3,
  };
  // Ultra and jackpot wear a wax seal pressed onto the plate; rare keeps
  // the quieter paper button.
  if (rarity === "ultra" || rarity === "jackpot") {
    const gold = rarity === "jackpot";
    return {
      style: {
        ...base,
        width: "26px",
        height: "26px",
        transform: gold ? "rotate(7deg)" : "rotate(-8deg)",
        background: gold
          ? "radial-gradient(circle at 35% 30%, #eecb6e, #b8892a 75%)"
          : "radial-gradient(circle at 35% 30%, #b98fe8, #6a3fb0 75%)",
        color: gold ? "#4a3608" : "#f3ecfc",
        border: `1px solid ${gold ? "#8a6a12" : "#5a3596"}`,
        boxShadow: "0 1px 3px rgba(0,0,0,.35)",
      },
      icon: gold ? "★" : "◆",
    };
  }
  return {
    style: { ...base, border: `1.5px solid ${rc.border}`, color: rc.text, background: "rgba(250,246,236,.92)" },
    icon: "✦",
  };
}

// Idle-phase filler: four dashed placeholder slots the same size/shape as
// the cards about to land. Purely decorative.
function GhostSlots({ minHeight }) {
  return (
    <div className="bdh-draft-grid">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ minHeight, borderRadius: "3px", border: `1px dashed ${t.borderDashed}`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

function SketchArt({ art, image, rarity, ratio, maxHeight }) {
  // Illustrated plates (data/survivor.js `image`) render in place of the SVG
  // sketch; the sketch stays as the fallback if the file is missing or fails
  // to load, so a settled card is never blank. Common art is slightly
  // desaturated so the higher tiers' full-color plates read richer; jackpot
  // gets a warm spotlight overlay.
  const [broken, setBroken] = useState(false);
  const spotlight = rarity === "jackpot" && (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 42%, rgba(255,214,110,.28), transparent 62%)",
      }}
    />
  );
  if (image && !broken) {
    return (
      <div style={{ position: "relative" }}>
        <img
          src={image}
          alt=""
          aria-hidden="true"
          onError={() => setBroken(true)}
          style={{
            ...ART_STYLE,
            aspectRatio: ratio,
            maxHeight,
            borderBottom: "1px solid rgba(42,38,32,.28)",
            filter: rarity === "common" ? "saturate(.72)" : "none",
          }}
        />
        {spotlight}
      </div>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <div style={{ ...ART_STYLE, aspectRatio: ratio, maxHeight, background: t.commonBg, borderBottom: "1px solid rgba(42,38,32,.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 64 64" style={{ height: "72%", display: "block" }} aria-hidden="true">
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
      </div>
      {spotlight}
    </div>
  );
}

export default function Draft({ round, respins, phase, cards, pickedId, reduceMotion, onRoll, onReroll, onPickCard }) {
  const slot = SURVIVOR_SLOTS[round];
  // Numeric form of the slot's art ratio (e.g. "6 / 5" → 1.2), for
  // computing how tall this page's cards actually run.
  const [arW, arH] = (slot.artRatio || "16 / 9").split("/").map(parseFloat);
  const minHeight = cardMinHeight(arW / arH);
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
        padding: "20px clamp(10px, 2.5vw, 18px) 20px",
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

      <div style={{ textAlign: "center", margin: "8px 0 12px" }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "clamp(26px, 4.5vw, 34px)", lineHeight: 1, letterSpacing: "1px", color: t.ink }}>{slot.title}</div>
        <div style={{ fontFamily: t.fontHand, fontWeight: 500, fontSize: "clamp(15px, 2.2vw, 18px)", color: t.muted, marginTop: "4px" }}>
          {slot.prompt} Roll for what fate hands over.
        </div>
      </div>

      {idle && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "22px", minHeight: 0 }}>
          <GhostSlots minHeight={minHeight} />
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
          <div data-noscroll="true" className="bdh-draft-grid">
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
              const traits = displayCard.traits || [];

              return (
                <button
                  // Remount the instant a slot settles so its landing
                  // animation reliably (re)plays, without disturbing the
                  // other 3 still-cycling slots.
                  key={`${i}-${isSettled}`}
                  className="bdh-id-card"
                  disabled={!revealed || !!pickedId}
                  onClick={() => revealed && onPickCard(displayCard)}
                  style={{
                    ...cardStyle(picked, revealed && !!pickedId, rarity, minHeight),
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
                  {isSettled && rarity === "rare" && <FoilCorners />}
                  {isSettled && (rarity === "ultra" || rarity === "jackpot") && <InnerFrame rarity={rarity} />}
                  {isSettled && rarity === "jackpot" && !reduceMotion && <Embers />}
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
                      <SketchArt art={displayCard.art} image={displayCard.image} rarity={rarity} ratio={slot.artRatio} maxHeight={ART_MAX_HEIGHT} />
                      <span style={rarityTagStyle(rarity)}>{t.RARITY_LABEL[rarity]}</span>
                      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "6px 10px 7px" }}>
                        <div style={{ fontSize: "clamp(12px, 1.6vw, 14px)", fontWeight: 700, letterSpacing: "1.2px", color: t.ink }}>
                          {displayCard.name.toUpperCase()}
                        </div>
                        <div
                          style={{
                            fontFamily: t.fontHand,
                            fontWeight: 500,
                            fontSize: "clamp(13px, 1.8vw, 15px)",
                            lineHeight: 1.2,
                            color: t.muted,
                            marginTop: "2px",
                          }}
                        >
                          {displayCard.line}
                        </div>
                        {/* Skill footer: what this piece actually does. Traits
                            unlock matching event choices (same labels the
                            events' REQUIRES locks use), so they render as
                            explicit "UNLOCKS" chips; trait-less pieces say so
                            outright rather than showing nothing. */}
                        <div style={{ marginTop: "auto", paddingTop: "5px" }}>
                          <div style={{ borderTop: `1px dashed ${t.borderSubtle}`, paddingTop: "4px" }}>
                            {traits.length > 0 ? (
                              <>
                                <div style={{ fontSize: "8px", letterSpacing: "2px", color: t.muted, marginBottom: "3px" }}>UNLOCKS</div>
                                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px" }}>
                                  {traits.map((tr) => (
                                    <span
                                      key={tr}
                                      title={`Unlocks "${TRAIT_LABELS[tr] || tr}" choices during events`}
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        letterSpacing: "1.5px",
                                        padding: "3px 8px 2px",
                                        borderRadius: "2px",
                                        border: `1px solid ${t.goldDark}`,
                                        background: t.highlightBg,
                                        color: t.highlightText,
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      ✦ {TRAIT_LABELS[tr] || tr}
                                    </span>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div style={{ fontSize: "9px", letterSpacing: "1.5px", color: t.rankMuted, paddingTop: "2px" }}>
                                — NO SPECIAL SKILL —
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: "relative", zIndex: 0, display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "12px" }}>
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
            // Stamped-brass plate, not a form button: gradient face, embossed
            // edges, and a punchier line than "reroll these 4."
            <button
              className="bdh-press"
              onClick={onReroll}
              style={{
                width: "100%",
                maxWidth: GRID_MAX_WIDTH,
                margin: "0 auto",
                border: `1px solid ${t.goldDark}`,
                cursor: "pointer",
                background: "linear-gradient(180deg, #e6bd5e 0%, #d4a843 55%, #c19536 100%)",
                color: "#3c2e08",
                fontFamily: t.fontBody,
                fontSize: "15px",
                letterSpacing: "3px",
                padding: "13px",
                borderRadius: "2px",
                flexShrink: 0,
                textShadow: "0 1px 0 rgba(255,255,255,.35)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.45), inset 0 -2px 0 rgba(0,0,0,.18), 0 3px 0 #8a6a12",
              }}
            >
              ⟳ ROLL FATE AGAIN &middot; {respins} TOKEN{respins === 1 ? "" : "S"} LEFT
            </button>
          )}
        </div>
      )}
    </div>
  );
}
