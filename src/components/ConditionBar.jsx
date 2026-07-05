import { useEffect, useRef, useState } from "react";
import * as t from "../styles/tokens.js";

const FLASH_MS = 900;

// Same thresholds the old pip meter used to color itself (hp<=2 = red,
// hp<=half = gold, else green) — kept identical so nothing about when
// "hurt" starts actually changes, just how it's communicated. hp<=0 gets
// its own word since a run essentially never lingers there (screen moves
// to Results), but the word should still be right if it's ever glimpsed
// mid-transition.
function conditionWord(hp, hpMax) {
  if (hp <= 0) return "FADING";
  if (hp <= 2) return "FAILING";
  if (hp <= Math.ceil(hpMax / 2)) return "HURT";
  return "STEADY";
}

// Typographic degradation instead of a color-coded meter — a health BAR
// reads like a game HUD; a word written in a shakier, fainter, redder hand
// as things get worse reads like a journal. `hp`/`hpMax` stay numeric in
// state for all real logic (DangerAtmosphere, achievements, etc.) — this
// component is the only place that ever turns it into text.
function wordStyle(word, reduceMotion) {
  const base = { fontFamily: t.fontBody, letterSpacing: "2px", fontSize: "14px", transition: "color .6s ease" };
  if (word === "STEADY") return { ...base, color: t.ink };
  if (word === "HURT") return { ...base, color: t.goldDark };
  if (word === "FAILING")
    return {
      ...base,
      color: t.blood,
      letterSpacing: "2.5px",
      animation: reduceMotion ? "none" : "bdhWordShake 2.4s ease-in-out infinite",
    };
  // FADING
  return {
    ...base,
    color: t.blood,
    letterSpacing: "3px",
    opacity: 0.82,
    textShadow: "0 0 6px rgba(198,40,40,.5)",
    animation: reduceMotion ? "none" : "bdhWordShake 1.1s ease-in-out infinite",
  };
}

export default function ConditionBar({ hp, hpMax, reduceMotion }) {
  const prevHpRef = useRef(hp);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    const prevHp = prevHpRef.current;
    const delta = hp - prevHp;
    prevHpRef.current = hp;
    if (delta === 0) return;
    setFlash({ type: delta < 0 ? "damage" : "heal", amount: delta, id: Date.now() });
    const timer = setTimeout(() => setFlash(null), FLASH_MS);
    return () => clearTimeout(timer);
  }, [hp]);

  const word = conditionWord(hp, hpMax);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "10px", letterSpacing: "2px", color: t.muted }}>CONDITION</span>
      <span style={{ position: "relative", display: "inline-flex" }}>
        <span
          style={{
            display: "inline-block",
            padding: "1px 5px",
            margin: "-1px -5px",
            borderRadius: "3px",
            background: flash ? (flash.type === "damage" ? "rgba(198,40,40,.3)" : "rgba(45,90,61,.3)") : "transparent",
            animation: flash ? (flash.type === "damage" ? "hpShake .4s ease" : "hpRise .45s ease") : "none",
            transition: "background .6s ease",
          }}
        >
          <span style={wordStyle(word, reduceMotion)}>{word}</span>
        </span>
        {flash && (
          <span
            key={flash.id}
            style={{
              position: "absolute",
              right: "-4px",
              top: "-14px",
              fontSize: "12px",
              fontWeight: "bold",
              color: flash.type === "damage" ? t.blood : t.green,
              animation: "deltaFloat .9s ease both",
              pointerEvents: "none",
            }}
          >
            {flash.amount > 0 ? "+" + flash.amount : flash.amount}
          </span>
        )}
      </span>
    </div>
  );
}
