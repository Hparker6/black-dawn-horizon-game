import * as t from "../styles/tokens.js";

export default function DiceOverlay({ show, dice, onContinue }) {
  if (!show || !dice) return null;
  const rolling = dice.phase === "rolling";
  const done = dice.phase === "done";
  const resultWord = dice.success ? "SUCCESS" : "FAILURE";
  const resultColor = dice.success ? t.green : t.blood;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "rgba(10,8,5,.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "26px",
        animation: "bdhOverlay .18s ease both",
      }}
    >
      <div
        style={{
          width: "100%",
          background: t.paper,
          borderRadius: "3px",
          padding: "26px 24px",
          boxShadow: "0 24px 48px -12px #000",
          textAlign: "center",
          animation: "bdhSlip .28s cubic-bezier(.2,1,.3,1) both",
        }}
      >
        <div style={{ fontSize: "11px", letterSpacing: "4px", color: t.muted }}>{dice.label} CHECK</div>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "86px", lineHeight: 1, color: t.ink, margin: "6px 0 4px" }}>
          {dice.roll || 0}
        </div>
        {rolling && (
          <div style={{ fontSize: "12px", letterSpacing: "3px", color: t.muted, animation: "bdhFlick .5s infinite" }}>
            ROLLING&hellip;
          </div>
        )}
        {done && (
          <div>
            {/* Survivor identity grants no stat bonuses, so this breakdown
                row only appears if a bonus ever exists again — a bare d10
                shouldn't display a "+0" that implies a number to chase. */}
            {(dice.bonus || 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", fontSize: "13px", color: t.muted, margin: "2px 0 4px" }}>
                <span>ROLL {dice.roll || 0}</span>
                <span style={{ color: t.borderSubtle }}>+</span>
                <span>
                  {dice.label} +{dice.bonus || 0}
                </span>
              </div>
            )}
            {dice.contributors && dice.contributors.length > 0 && (
              <div style={{ fontSize: "10px", letterSpacing: ".5px", color: t.goldDark, marginBottom: "10px" }}>
                {dice.contributors.map((c, i) => (
                  <span key={i}>
                    {i > 0 && " · "}
                    +{c.amount} {c.name}
                  </span>
                ))}
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "22px",
                borderTop: `1px solid ${t.borderSubtle}`,
                borderBottom: `1px solid ${t.borderSubtle}`,
                padding: "10px 0",
                marginBottom: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "2px", color: t.muted }}>TOTAL</div>
                <div style={{ fontSize: "28px", color: t.ink }}>{dice.total || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "2px", color: t.muted }}>NEEDED</div>
                <div style={{ fontSize: "28px", color: t.muted }}>{dice.needed || 0}</div>
              </div>
            </div>
            <div style={{ fontFamily: t.fontDisplay, fontSize: "38px", letterSpacing: "1px", color: resultColor, animation: "bdhPulse .5s ease" }}>
              {resultWord}
            </div>
            <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#2a2620", margin: "10px 2px 18px", textWrap: "pretty" }}>{dice.msg}</p>
            <button
              onClick={onContinue}
              style={{
                width: "100%",
                border: "none",
                cursor: "pointer",
                background: t.ink,
                color: t.paper,
                fontFamily: t.fontBody,
                fontSize: "16px",
                letterSpacing: "3px",
                padding: "13px",
                borderRadius: "2px",
              }}
            >
              CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
