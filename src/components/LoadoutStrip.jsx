import { useState } from "react";
import * as t from "../styles/tokens.js";

// Persistent but quiet: a slim strip docked to the bottom of the panel
// (outside the reading column, so it never competes with the story) showing
// the 5 drafted items as small rarity-colored swatches. Collapsed by
// default on any screen size — tap/click expands it to full tags with
// names and traits; hovering a swatch shows the same via the native title
// tooltip, which costs nothing extra for desktop mouse users.
export default function LoadoutStrip({ loadout }) {
  const [expanded, setExpanded] = useState(false);
  if (!loadout || loadout.length === 0) return null;

  return (
    <div
      style={{
        borderTop: `1px solid ${t.borderSubtle}`,
        background: "rgba(101,67,26,.04)",
        flexShrink: 0,
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "7px 16px",
          fontFamily: t.fontBody,
        }}
      >
        <span style={{ fontSize: "9px", letterSpacing: "1.5px", color: t.rankMuted }}>LOADOUT</span>
        <span style={{ display: "flex", gap: "5px" }}>
          {loadout.map((item, i) => {
            const rc = t.rarityColors(item.rarity);
            return (
              <span
                key={i}
                title={item.name + (item.trait ? ` — ${item.trait}` : "")}
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: rc.border,
                  boxShadow: item.rarity === "jackpot" || item.rarity === "ultra" ? `0 0 4px 1px ${rc.border}` : "none",
                }}
              />
            );
          })}
        </span>
        <span style={{ fontSize: "9px", color: t.rankMuted }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", padding: "0 16px 10px" }}>
          {loadout.map((item, i) => {
            const rc = t.rarityColors(item.rarity);
            return (
              <span
                key={i}
                style={{
                  fontSize: "10px",
                  letterSpacing: ".3px",
                  color: rc.text,
                  border: `1px solid ${rc.border}`,
                  background: rc.bg,
                  borderRadius: "2px",
                  padding: "3px 7px",
                }}
              >
                {item.name}
                {item.trait ? ` · ${item.trait}` : ""}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
