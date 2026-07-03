import * as t from "../styles/tokens.js";

function navStyle(active) {
  return {
    flex: 1,
    cursor: "pointer",
    fontFamily: t.fontBody,
    fontSize: "12px",
    letterSpacing: "1.5px",
    padding: "10px 4px",
    border: "none",
    borderRadius: "3px 3px 0 0",
    background: active ? t.paper : "transparent",
    color: active ? t.ink : t.rankMuted,
    borderBottom: active ? `3px solid ${t.blood}` : "3px solid transparent",
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
