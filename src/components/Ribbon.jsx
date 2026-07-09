import * as t from "../styles/tokens.js";

// Sprint 3: nav reads as paper index tabs sticking up from the journal, not
// website navigation. The active tab is the page you're on — full paper,
// flush with the panel below; inactive tabs are older, dimmer paper sitting
// slightly lower in the stack. No underlines, no accent bars.
function navStyle(active) {
  return {
    flex: 1,
    // Flex items default to min-width:auto, which refuses to shrink below
    // the text's own intrinsic width — with "ACHIEVEMENTS" letter-spaced at
    // 4 equal-flex tabs, that forced the whole ribbon wider than a 375px
    // viewport (a real horizontal-scroll bug, not just a visual clip).
    // minWidth:0 lets flex-shrink actually apply; the ellipsis is the
    // graceful fallback if a tab still can't fit its full label.
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    cursor: "pointer",
    fontFamily: t.fontBody,
    fontSize: "12px",
    letterSpacing: "1.5px",
    padding: active ? "11px 4px 10px" : "8px 4px 7px",
    marginTop: active ? 0 : "5px",
    border: active ? "1px solid rgba(20,16,12,.25)" : "1px solid rgba(20,16,12,.35)",
    borderBottom: "none",
    borderRadius: "4px 4px 0 0",
    background: active ? t.paper : "#c9bc9e",
    color: active ? t.ink : "#5f5744",
    boxShadow: active ? "0 -2px 6px -2px rgba(0,0,0,.4)" : "inset 0 -6px 8px -8px rgba(0,0,0,.55)",
    transition: "background .2s ease, margin-top .2s ease, padding .2s ease",
  };
}

export default function Ribbon({ tab, onTabSurvival, onTabLeader, onTabAch, onTabEndings, onExitToTitle }) {
  return (
    <header
      style={{
        background: t.ribbonBg,
        borderRadius: "2px",
        boxShadow: "0 12px 26px -14px #000",
        padding: "12px 14px 0",
        backgroundImage: t.noiseHeaderBg,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px 10px" }}>
        <div
          onClick={onExitToTitle}
          title="Return to menu"
          style={{ fontFamily: t.fontDisplay, fontSize: "22px", letterSpacing: "1px", color: t.paper, lineHeight: 1, cursor: "pointer" }}
        >
          BLACK DAWN <span style={{ color: t.blood }}>HORIZON</span>
        </div>
        <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#7a6f56" }}>EST. THE COLLAPSE</div>
      </div>
      <nav style={{ display: "flex", gap: "3px" }}>
        <button onClick={onTabSurvival} style={navStyle(tab === "survival")}>
          SURVIVAL
        </button>
        <button onClick={onTabLeader} style={navStyle(tab === "leaderboard")}>
          LEADERBOARD
        </button>
        <button onClick={onTabAch} style={navStyle(tab === "achievements")}>
          ACHIEVEMENTS
        </button>
        <button onClick={onTabEndings} style={navStyle(tab === "endings")}>
          ENDINGS
        </button>
      </nav>
    </header>
  );
}
