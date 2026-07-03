import * as t from "../styles/tokens.js";

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
  return { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridAutoRows: "1fr", gap: "9px", flex: "1", minHeight: "0" };
}

function cardStyle(picked, pending, index, layout, rare) {
  const base = {
    position: "relative",
    textAlign: "left",
    cursor: picked ? "default" : "pointer",
    borderRadius: "3px",
    padding: "11px 12px 10px",
    fontFamily: t.fontBody,
    border: "1px solid " + (picked ? t.blood : rare ? t.rareBorder : t.commonBorder),
    background: picked ? t.pickedBg : rare ? t.rareBg : t.commonBg,
    boxShadow: picked ? "0 0 0 2px #c62828 inset" : rare ? "0 2px 6px -3px rgba(0,0,0,.3)" : "0 2px 6px -3px rgba(0,0,0,.25)",
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
  return { ...base, minHeight: "150px", animation: "bdhLand .38s cubic-bezier(.2,1.2,.4,1) both", animationDelay: index * 90 + "ms" };
}

function cardDescStyle(layout) {
  const base = { fontSize: "11px", color: t.muted, fontStyle: "italic", marginTop: "4px", lineHeight: "1.35" };
  if (layout === "Fanned Hand") return { ...base, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" };
  return base;
}

export default function Draft({ round, totalRounds, category, respins, phase, cards, pickedId, layout, onRoll, onReroll, onPickCard }) {
  const idle = phase === "idle";
  const rolling = phase === "rolling";
  const revealed = phase === "revealed";
  const canReroll = revealed && respins > 0;

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

      {rolling && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "9px", justifyContent: "center" }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                border: `1px dashed ${t.borderSubtle}`,
                borderRadius: "3px",
                padding: "15px",
                textAlign: "center",
                fontSize: "15px",
                color: t.rankMuted,
                animation: "bdhFlick .28s infinite",
              }}
            >
              ? ? ?
            </div>
          ))}
        </div>
      )}

      {revealed && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, minHeight: 0 }}>
          <div data-noscroll="true" style={cardsContainerStyle(layout)}>
            {cards.map((card, i) => {
              const picked = pickedId === card.id;
              const rare = !!card.trait;
              const common = !card.trait;
              return (
                <button key={card.id} onClick={() => onPickCard(card)} style={cardStyle(picked, !!pickedId, i, layout, rare)}>
                  {rare && (
                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: `1.5px solid ${t.rareBorder}`,
                        color: t.highlightText,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        background: t.rareBg,
                        zIndex: 1,
                      }}
                    >
                      ✦
                    </span>
                  )}
                  {common && (
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
                  <div style={{ position: "relative", zIndex: 0, display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ fontSize: "15px", color: t.ink, letterSpacing: ".3px", paddingRight: "22px" }}>{card.name}</div>
                    <div style={cardDescStyle(layout)}>{card.desc}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "auto", paddingTop: "8px" }}>
                      {cardChips(card).map((chp, ci) => (
                        <span key={ci} style={chp.style}>
                          {chp.label}
                        </span>
                      ))}
                    </div>
                  </div>
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
