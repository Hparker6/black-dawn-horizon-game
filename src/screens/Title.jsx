import * as t from "../styles/tokens.js";

export default function Title({ best, played, onPlay }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "44px 30px 34px", animation: "bdhFadeUp .5s ease both" }}>
      <div style={{ fontSize: "11px", letterSpacing: "3px", color: t.muted, textAlign: "center" }}>
        SURVIVAL MODE &middot; FIELD JOURNAL
      </div>
      <div style={{ height: "1px", background: t.borderSubtle, margin: "14px 0 auto" }} />
      <div style={{ textAlign: "center", margin: "auto 0" }}>
        <div
          style={{
            fontFamily: t.fontDisplay,
            color: t.ink,
            lineHeight: 0.9,
            letterSpacing: "2px",
            fontSize: "58px",
            textShadow: "2px 2px 0 rgba(198,40,40,.18)",
            animation: "bdhFlick 6s ease-in-out infinite",
          }}
        >
          BLACK
          <br />
          DAWN
          <br />
          <span style={{ color: t.blood }}>HORIZON</span>
        </div>
        <div style={{ marginTop: "20px", fontSize: "15px", color: t.muted, letterSpacing: "1px" }}>
          &ldquo;How long would you survive?&rdquo;
        </div>
      </div>
      <div style={{ height: "1px", background: t.borderSubtle, margin: "auto 0 24px" }} />
      <button
        onClick={onPlay}
        className="bdh-press"
        style={{
          width: "100%",
          border: "none",
          cursor: "pointer",
          background: t.ink,
          color: t.paper,
          fontFamily: t.fontBody,
          fontSize: "20px",
          letterSpacing: "4px",
          padding: "18px",
          borderRadius: "2px",
          boxShadow: "0 4px 0 #000",
        }}
      >
        BEGIN
      </button>
      <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
        <div style={{ flex: 1, textAlign: "center", border: `1px dashed ${t.borderDashed}`, borderRadius: "2px", padding: "12px 6px" }}>
          <div style={{ fontSize: "26px", color: t.green }}>{best}</div>
          <div style={{ fontSize: "10px", letterSpacing: "2px", color: t.muted, marginTop: "2px" }}>BEST &middot; DAYS</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", border: `1px dashed ${t.borderDashed}`, borderRadius: "2px", padding: "12px 6px" }}>
          <div style={{ fontSize: "26px", color: t.ink }}>{played}</div>
          <div style={{ fontSize: "10px", letterSpacing: "2px", color: t.muted, marginTop: "2px" }}>RUNS PLAYED</div>
        </div>
      </div>
    </div>
  );
}
