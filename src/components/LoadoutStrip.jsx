import { useState } from "react";
import * as t from "../styles/tokens.js";
import { routeModifier } from "../engine/pacing.js";

function itemTag(item, i, showTrait) {
  const rc = t.rarityColors(item.rarity);
  return (
    <span
      key={i}
      title={item.name + (item.trait ? ` — ${item.trait}` : "")}
      style={{
        fontSize: "10px",
        letterSpacing: ".3px",
        color: rc.text,
        border: `1px solid ${rc.border}`,
        background: rc.bg,
        borderRadius: "2px",
        padding: "3px 7px",
        boxShadow: item.rarity === "jackpot" || item.rarity === "ultra" ? `0 0 4px 1px ${rc.border}` : "none",
        whiteSpace: "nowrap",
      }}
    >
      {item.name}
      {showTrait && item.trait ? ` · ${item.trait}` : ""}
    </span>
  );
}

// Persistent but quiet: a slim strip docked to the bottom of the panel
// (outside the reading column, so it never competes with the story) —
// always shows the carried items as actual readable, rarity-colored name
// tags (not abstract dots), so a player can see at a glance what's in a
// trait-gated choice's way. Collapsed by default: names only, wrapping onto
// a second line at narrow widths. Expanded adds each item's trait, so the
// player can tie a locked choice's "REQUIRES X" badge back to which
// specific item would unlock it. `route` (the intro's highway/backroads
// flag, see data/intro.js) shows here too — a small label, not a mechanic
// explainer, so the choice reads as "this is still shaping the run" without
// spelling out the actual weighting.
export default function LoadoutStrip({ loadout, route }) {
  const [expanded, setExpanded] = useState(false);
  if (!loadout || loadout.length === 0) return null;
  const routeLabel = routeModifier(route).label;

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
          flexWrap: "wrap",
          gap: "6px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "8px 16px",
          fontFamily: t.fontBody,
        }}
      >
        {routeLabel && (
          <span style={{ fontSize: "9px", letterSpacing: "1px", color: t.goldDark, marginRight: "6px", paddingRight: "8px", borderRight: `1px solid ${t.borderSubtle}` }}>
            {routeLabel}
          </span>
        )}
        <span style={{ fontSize: "9px", letterSpacing: "1.5px", color: t.rankMuted, marginRight: "2px" }}>LOADOUT</span>
        {loadout.map((item, i) => itemTag(item, i, expanded))}
        <span style={{ fontSize: "9px", color: t.rankMuted, marginLeft: "2px" }}>{expanded ? "▲" : "▼"}</span>
      </button>
    </div>
  );
}
