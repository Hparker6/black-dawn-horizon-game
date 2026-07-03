import { useEffect, useRef, useState } from "react";
import * as t from "../styles/tokens.js";
import JackpotConfetti from "../components/JackpotConfetti.jsx";

function chip(kind, label) {
  const map = { cmb: t.blood, srv: t.green, wit: t.muted, hp: t.ink, trait: t.goldDark };
  const c = map[kind] || t.muted;
  return { label, style: { fontSize: "10px", letterSpacing: ".5px", color: c, border: `1px solid ${c}`, borderRadius: "2px", padding: "2px 6px" } };
}

function cardChips(card) {
  const out = [];
  if (card.stats.combat) out.push(chip("cmb", "CMB +" + card.stats.combat));
  if (card.stats.survival) out.push(chip("srv", "SRV +" + card.stats.survival));
  if (card.stats.wits) out.push(chip("wit", "WIT +" + card.stats.wits));
  if (card.stats.health) out.push(chip("hp", "COND +" + card.stats.health));
  if (card.trait) out.push(chip("trait", "✦ " + card.tlabel));
  return out;
}

function cardsContainerStyle(layout) {
  if (layout === "Fanned Hand")
    return { position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end", minHeight: "250px", paddingBottom: "14px", flex: "1" };
  if (layout === "Pack Reveal")
    return { display: "flex", gap: "10px", overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: "4px", flex: "1", minHeight: "0", scrollbarWidth: "none" };
  // Grid Compare: 2x2, capped width so cards stay card-shaped (not tall
  // columns) even on the wide desktop frame. No flex:1/1fr rows here on
  // purpose — that stretched cards to fill the whole panel height. Sized to
  // content instead, so both rows stay compact and the block centers in the
  // available space (see the "active" wrapper below).
  return { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "520px", width: "100%", margin: "0 auto" };
}

// Rarity is a visual axis only (see data/items.js) — border/background color
// and idle glow intensity scale with tier, stats do not.
function cardStyle(picked, pending, index, layout, rarity) {
  const rc = t.rarityColors(rarity);
  const base = {
    position: "relative",
    textAlign: "left",
    cursor: picked ? "default" : "pointer",
    borderRadius: "3px",
    padding: "11px 12px 10px",
    fontFamily: t.fontBody,
    border: "1px solid " + (picked ? t.blood : rc.border),
    background: picked ? t.pickedBg : rc.bg,
    boxShadow: picked ? "0 0 0 2px #c62828 inset" : "0 2px 6px -3px rgba(0,0,0,.25)",
    transition: "transform .15s, box-shadow .15s",
    opacity: pending && !picked ? 0.35 : 1,
    overflow: "hidden",
  };
  if (layout === "Fanned Hand") {
    const off = index - 1.5;
    const lift = picked ? "translateY(-20px) rotate(0deg) scale(1.05)" : `translateY(${Math.abs(off) * 12}px) rotate(${off * 8}deg)`;
    return {
      ...base,
      width: "118px",
      height: "196px",
      marginLeft: index === 0 ? "0" : "-32px",
      transformOrigin: "bottom center",
      transform: lift,
      zIndex: picked ? 60 : 10 + index,
      animation: "bdhFanIn .35s ease both",
      animationDelay: index * 90 + "ms",
    };
  }
  if (layout === "Pack Reveal") {
    return {
      ...base,
      minWidth: "76%",
      scrollSnapAlign: "center",
      minHeight: "188px",
      flexShrink: 0,
      animation: "bdhFlipIn .5s cubic-bezier(.2,1,.3,1) both",
      animationDelay: index * 120 + "ms",
    };
  }
  return { ...base, minHeight: "144px" };
}

function cardDescStyle(layout) {
  const base = { fontSize: "11px", color: t.muted, fontStyle: "italic", marginTop: "4px", lineHeight: "1.35" };
  if (layout === "Fanned Hand") return { ...base, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" };
  return base;
}

// Settle-pop + idle-glow animation names, scaled by rarity (see the
// bdhSettle*/rarityGlow* keyframes in index.css). Comma-separated so the
// one-time landing pop and the continuous idle glow both run.
const SETTLE_ANIM = {
  common: "bdhSettleCommon .3s cubic-bezier(.2,1.3,.4,1), rarityGlowCommon 3s ease-in-out infinite",
  rare: "bdhSettleRare .32s cubic-bezier(.2,1.3,.4,1), rarityGlowRare 2.6s ease-in-out infinite",
  ultra: "bdhSettleUltra .36s cubic-bezier(.2,1.3,.4,1), rarityGlowUltra 2.2s ease-in-out infinite",
  jackpot: "bdhSettleJackpot .42s cubic-bezier(.2,1.3,.4,1), rarityGlowJackpot 3.4s linear infinite",
};

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

// Shuffle timing: fast cycling through the category pool, then each of the 4
// slots stops one at a time (staggered) so the deceleration reads as a
// slot-machine landing rather than all 4 snapping at once. Slot settle times
// must land before App.jsx's ROLL_DELAY_MS flips phase to "revealed", so the
// transition into interactive mode is seamless — nothing visibly changes at
// that flip, the cards are already sitting there correct.
const CYCLE_TICK_MS = 80;
const SETTLE_AT_MS = [650, 830, 1010, 1190];
const CYCLE_TICK_MS_REDUCED = 70;
const SETTLE_AT_MS_REDUCED = [60, 110, 160, 210];
const CELEBRATE_MS = 900;

function randomCard(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Draft({ round, totalRounds, category, respins, phase, cards, pickedId, layout, reduceMotion, onRoll, onReroll, onPickCard }) {
  const idle = phase === "idle";
  const active = phase === "rolling" || phase === "revealed";
  const revealed = phase === "revealed";
  const canReroll = revealed && respins > 0;

  const [faces, setFaces] = useState([null, null, null, null]);
  const [settled, setSettled] = useState([false, false, false, false]);
  const [celebrate, setCelebrate] = useState([false, false, false, false]);

  useEffect(() => {
    if (phase !== "rolling") return;
    const tickMs = reduceMotion ? CYCLE_TICK_MS_REDUCED : CYCLE_TICK_MS;
    const settleTimes = reduceMotion ? SETTLE_AT_MS_REDUCED : SETTLE_AT_MS;
    const pool = category.cards;

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
  }, [phase, category, cards, reduceMotion]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 18px 20px", animation: "bdhFadeUp .4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "24px", color: t.ink, letterSpacing: "1px" }}>
          ROUND {round + 1} / {totalRounds}
        </div>
        <div style={{ fontSize: "11px", letterSpacing: "1px", color: t.muted, textAlign: "right" }}>
          REROLL
          <br />
          <span style={{ fontSize: "19px", color: t.gold }}>◈ {respins}</span>
        </div>
      </div>
      <div style={{ fontFamily: t.fontDisplay, fontSize: "21px", color: t.ink, marginTop: "5px", letterSpacing: ".5px" }}>{category.cat}</div>
      <div style={{ fontSize: "12px", color: t.muted, fontStyle: "italic", margin: "2px 0 14px", textWrap: "pretty" }}>{category.constraint}</div>

      {idle && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "20px" }}>
          <button
            onClick={onRoll}
            style={{
              width: "100%",
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
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px", flex: 1, minHeight: 0 }}>
          <div data-noscroll="true" style={cardsContainerStyle(layout)}>
            {[0, 1, 2, 3].map((i) => {
              // While rolling and not yet settled, show the cycling face from
              // the category pool (name only — full detail would just blur
              // past at this tick rate). Once settled (mid-roll) or revealed,
              // show the real drafted card exactly as before.
              const isSettled = revealed || settled[i];
              const displayCard = isSettled ? cards[i] : faces[i];
              if (!displayCard) return <div key={i} />;

              const picked = revealed && pickedId === displayCard.id;
              const rarity = displayCard.rarity || "common";
              const badge = isSettled ? rarityBadge(rarity) : null;
              const showDogEar = isSettled && rarity === "common";
              const showShimmer = isSettled && (rarity === "ultra" || rarity === "jackpot");

              return (
                <button
                  // Remount the instant a slot settles so its landing
                  // animation reliably (re)plays, without disturbing the
                  // other 3 still-cycling slots.
                  key={`${i}-${isSettled}`}
                  onClick={() => revealed && onPickCard(displayCard)}
                  style={{
                    ...cardStyle(picked, revealed && !!pickedId, i, layout, rarity),
                    cursor: revealed ? cardStyle(picked, false, i, layout, rarity).cursor : "default",
                    // No forwards/both fill: once the pop plays, control
                    // reverts to the boxShadow/transform cardStyle() already
                    // computed above (picked/rarity-aware), so picking a card
                    // later isn't fighting a frozen animation frame.
                    animation: isSettled ? SETTLE_ANIM[rarity] : "bdhFlick .5s ease-in-out infinite",
                  }}
                >
                  {showShimmer && (
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        overflow: "hidden",
                        pointerEvents: "none",
                        zIndex: 1,
                      }}
                    >
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
                  {badge && (
                    <span style={badge.style}>{badge.icon}</span>
                  )}
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
                      <div style={{ fontSize: "9px", letterSpacing: "1.5px", color: t.rarityColors(rarity).text, marginBottom: "2px" }}>
                        {t.RARITY_LABEL[rarity]}
                      </div>
                      <div style={{ fontSize: "15px", color: t.ink, letterSpacing: ".3px", paddingRight: "22px" }}>{displayCard.name}</div>
                      <div style={cardDescStyle(layout)}>{displayCard.desc}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "auto", paddingTop: "8px" }}>
                        {cardChips(displayCard).map((chp, ci) => (
                          <span key={ci} style={chp.style}>
                            {chp.label}
                          </span>
                        ))}
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
              ⟳ REROLL THESE 4 &middot; 1 LEFT
            </button>
          )}
        </div>
      )}
    </div>
  );
}
