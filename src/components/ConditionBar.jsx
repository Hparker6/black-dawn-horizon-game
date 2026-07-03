import { useEffect, useRef, useState } from "react";
import * as t from "../styles/tokens.js";

const FLASH_MS = 900;

// Pips react the instant `hp` changes: a hit flashes red + shakes + a "-N"
// floats up, a heal pulses green + rises + a "+N" floats up. Detecting the
// change internally (rather than taking an external trigger prop) means it
// fires correctly whether hp changed via an instant trait/plain result or a
// dice check resolving — same beat the outcome appears, no wiring needed at
// each call site.
export default function ConditionBar({ hp, hpMax }) {
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

  const pips = [];
  for (let i = 0; i < hpMax; i++) {
    const on = i < hp;
    const color = hp <= 2 ? t.blood : hp <= Math.ceil(hpMax / 2) ? t.gold : t.green;
    pips.push({ on, color });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "10px", letterSpacing: "2px", color: t.muted }}>CONDITION</span>
      <span style={{ position: "relative", display: "inline-flex" }}>
        <span
          style={{
            display: "flex",
            gap: "3px",
            padding: "2px 3px",
            margin: "-2px -3px",
            borderRadius: "3px",
            background: flash ? (flash.type === "damage" ? "rgba(198,40,40,.3)" : "rgba(45,90,61,.3)") : "transparent",
            animation: flash ? (flash.type === "damage" ? "hpShake .4s ease" : "hpRise .45s ease") : "none",
            transition: "background .6s ease",
          }}
        >
          {pips.map((pip, i) => (
            <span
              key={i}
              style={{
                width: "7px",
                height: "14px",
                borderRadius: "1px",
                background: pip.on ? pip.color : "transparent",
                border: "1px solid " + (pip.on ? "transparent" : t.borderSubtle),
              }}
            />
          ))}
        </span>
        {flash && (
          <span
            key={flash.id}
            style={{
              position: "absolute",
              right: "-4px",
              top: "-4px",
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
