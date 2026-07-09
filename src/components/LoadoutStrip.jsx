import { useState } from "react";
import * as t from "../styles/tokens.js";
import { routeModifier } from "../engine/pacing.js";
import { TRAIT_LABELS } from "../data/survivor.js";

// One accent per identity slot — weapon reads dangerous, companion reads
// alive, keepsake reads precious — so the strip mirrors the same color
// language the draft pages and choice badges use. Never color alone: the
// expanded view names the slot in words.
const KIND_COLOR = { weapon: t.blood, companion: t.green, keepsake: t.goldDark };
const KIND_LABEL = { weapon: "WEAPON", companion: "COMPANION", keepsake: "KEEPSAKE" };

function pieceTag(item, i, expanded) {
  const c = KIND_COLOR[item.kind] || t.muted;
  const traitLabels = (item.traits || []).map((tr) => TRAIT_LABELS[tr] || tr).join(" · ");
  return (
    <span
      key={i}
      title={`${KIND_LABEL[item.kind] || ""}: ${item.name}${traitLabels ? ` — ${traitLabels}` : ""}`}
      style={{
        fontSize: "10px",
        letterSpacing: ".3px",
        color: c,
        border: `1px solid ${c}`,
        borderRadius: "2px",
        padding: "3px 7px",
        background: "rgba(255,252,244,.5)",
        whiteSpace: "nowrap",
      }}
    >
      {expanded ? `${KIND_LABEL[item.kind]} · ` : ""}
      {item.name}
      {expanded && traitLabels ? ` · ${traitLabels}` : ""}
    </span>
  );
}

// Persistent but quiet: a slim strip docked to the bottom of the panel
// (outside the reading column, so it never competes with the story) —
// shows WHO this run is (the three drafted identity pieces) as readable,
// slot-colored name tags. Collapsed: names only. Expanded: each piece's
// slot plus the capability labels it brings (so a locked "REQUIRES Pry
// Open" badge upstream can be traced back to which pick would satisfy it).
// `route` (the intro's highway/backroads flag) shows here too — a small
// label, not a mechanic explainer.
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
        <span style={{ fontSize: "9px", letterSpacing: "1.5px", color: t.rankMuted, marginRight: "2px" }}>THE SURVIVOR</span>
        {loadout.map((item, i) => pieceTag(item, i, expanded))}
        <span style={{ fontSize: "9px", color: t.rankMuted, marginLeft: "2px" }}>{expanded ? "▲" : "▼"}</span>
      </button>
    </div>
  );
}
