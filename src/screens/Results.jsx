import * as t from "../styles/tokens.js";
import {
  ENDINGS,
  ENDING_RECAPS,
  GENERIC_DEATH_RECAP,
  GENERIC_SURVIVAL_RECAP,
  ENDING_IMAGES,
  endingArt,
  endingNote,
} from "../data/endings.js";
import { getEndingReflection, getIdentityEpithet } from "../engine/character-profile.js";
import { routeModifier } from "../engine/pacing.js";

// The results screen is ONE journal page: the weathered plate
// (public/ending-bg.jpg — polaroid, marginalia notes, dog tags, map scrap,
// blood spatter, Black Dawn Horizon stamp, all baked in) owns the whole
// screen, and every piece of live content — headline, margin note, ending
// painting, stats, identity, reflection, record and buttons — is inked
// directly onto its paper. Nothing lives on a separate strip below.
//
// The plate is guaranteed text-free except the two generic baked notes
// ("The road out was never easy…" / "You didn't just survive…"): the
// ending-specific margin note and the headline are LIVE text only (the
// baked versions were cloned out of the artwork), so no run can ever show
// doubled or contradictory text.
//
// The per-ending painting (data/endings.js ENDING_IMAGES) renders with
// multiply blending and a feathered mask so it sinks into the aged paper
// instead of sitting on it like a pasted white rectangle; endings without
// a painting fall back to their transparent inked SVG sketch.
//
// Desktop/tablet (≥721px) put everything on the plate, sized in cqw so the
// composition scales as one piece; the plate's aspect-ratio is a preferred
// size, so an unusually long reflection grows the page instead of
// colliding or clipping. Phones re-flow the same content as a single
// column on plain paper (.bdh-flow-only) where plate-scaled type would be
// unreadably small.

// Small stroke icons for the stat rows that don't map to a drafted piece.
const ROW_ICONS = {
  route: `<path d="M32 58 V36"/><path d="M32 36 C24 28 22 18 20 8"/><path d="M32 36 C40 28 42 18 44 8"/><path d="M16 12 l8 -2 M48 12 l-8 -2"/>`,
  run: `<circle cx="32" cy="34" r="12"/><path d="M32 14 v-6 M32 60 v-6 M12 34 h-6 M58 34 h-6 M18 20 l-4 -4 M50 20 l4 -4"/>`,
  best: `<path d="M32 8 L38 24 L55 25 L42 36 L47 53 L32 43 L17 53 L22 36 L9 25 L26 24 Z"/>`,
  ending: `<path d="M20 8 V58"/><path d="M20 12 H46 L39 21 L46 30 H20"/>`,
};

// Feathered edge + multiply so the painting soaks into the paper.
const BLEND_STYLE = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  mixBlendMode: "multiply",
  WebkitMaskImage: "radial-gradient(115% 115% at 50% 50%, #000 58%, transparent 97%)",
  maskImage: "radial-gradient(115% 115% at 50% 50%, #000 58%, transparent 97%)",
};

function EndingPicture({ endingId, died, label }) {
  const image = endingId ? ENDING_IMAGES[endingId] : null;
  if (image) return <img src={image} alt={`Closing illustration: ${label}`} style={BLEND_STYLE} />;
  return (
    <svg
      viewBox="0 0 160 90"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%", display: "block", opacity: 0.9 }}
      role="img"
      aria-label={`Closing illustration: ${label}`}
    >
      <g fill="none" stroke="#2a2620" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: endingArt(endingId, died) }} />
    </svg>
  );
}

function RowIcon({ art }) {
  if (!art) return null;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" style={{ width: "100%", height: "100%", display: "block" }}>
      <g fill="none" stroke="#2a2620" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: art }} />
    </svg>
  );
}

// One stat line: tiny line-icon, typewritten label, handwritten value.
// Sized in cqw on the plate, px in the phone re-flow.
function StatRow({ icon, label, value, inPlate }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: inPlate ? "0.9cqw" : "10px",
        padding: inPlate ? ".5cqw 0" : "7px 0",
        borderBottom: "1px dashed rgba(90,85,72,.4)",
        minWidth: 0,
      }}
    >
      <span style={{ width: inPlate ? "2.2cqw" : "24px", height: inPlate ? "2.2cqw" : "24px", flexShrink: 0, opacity: 0.85 }}>
        <RowIcon art={icon} />
      </span>
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ fontSize: inPlate ? "0.9cqw" : "9px", letterSpacing: "2px", color: "#6b6252", fontFamily: t.fontBody }}>{label}</span>
        <span
          style={{
            fontFamily: t.fontHand,
            fontWeight: 600,
            fontSize: inPlate ? "1.6cqw" : "17px",
            lineHeight: 1.1,
            color: "#2a2620",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </span>
      </span>
    </div>
  );
}

function StatGrid({ rows, inPlate }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: inPlate ? "2.4cqw" : "18px" }}>
      {rows.map((r, i) => (
        // Odd row out (the ENDING line) spans the full width — it's the
        // line the whole journal was building toward, and ending labels
        // are too long for half a column.
        <div key={r.label} style={i === rows.length - 1 && rows.length % 2 ? { gridColumn: "1 / -1" } : undefined}>
          <StatRow {...r} inPlate={inPlate} />
        </div>
      ))}
    </div>
  );
}

export default function Results({ died, day, best, tier, endingId, newAch, newEnding, characterProfile, identity, route, shareLabel, onShare, onAgain }) {
  const headline = died ? "YOU DIED" : "YOU SURVIVED";
  const subtitle = died ? "THE ROAD KEEPS WHAT IT'S OWED." : "THE DEAD CITY COULDN'T BREAK YOU.";
  const endingMeta = endingId ? ENDINGS.find((e) => e.id === endingId) : null;
  const rEnding = endingMeta ? endingMeta.label : died ? "Died on the road" : "Reached the Coast";
  const hasNewAch = newAch > 0;

  const item = identity.weapon ? identity.weapon.name.toLowerCase() : died ? "nothing" : "little";
  const known = endingId ? ENDING_RECAPS[endingId] : null;
  const recap = known && known.died === died ? known.recap(item, day) : died ? GENERIC_DEATH_RECAP(item, day) : GENERIC_SURVIVAL_RECAP(item, day);
  const reflection = getEndingReflection(characterProfile);
  const epithet = getIdentityEpithet(characterProfile);
  const routeLabel = routeModifier(route).label;
  const note = endingNote(endingId, died, day);

  const name = (piece) => (piece ? piece.name : "—");
  const statRows = [
    { icon: identity.weapon && identity.weapon.art, label: "WEAPON", value: name(identity.weapon) },
    { icon: identity.companion && identity.companion.art, label: "COMPANION", value: name(identity.companion) },
    { icon: identity.keepsake && identity.keepsake.art, label: "KEEPSAKE", value: name(identity.keepsake) },
    { icon: ROW_ICONS.route, label: "ROUTE", value: routeLabel ? routeLabel.charAt(0) + routeLabel.slice(1).toLowerCase() : "—" },
    { icon: ROW_ICONS.run, label: "THIS RUN", value: `${day} days · ${tier}` },
    { icon: ROW_ICONS.best, label: "BEST RUN", value: `${Math.max(best || 0, day)} days` },
    { icon: ROW_ICONS.ending, label: "ENDING", value: rEnding },
  ];

  const recordLine =
    hasNewAch || newEnding
      ? [hasNewAch ? `${newAch} new medal${newAch > 1 ? "s" : ""} earned` : null, newEnding ? `a new ending discovered — "${rEnding}"` : null]
          .filter(Boolean)
          .join(" · ")
      : null;

  const whoYouBecame = (inPlate) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: inPlate ? "0.95cqw" : "9px", letterSpacing: "3px", color: "#6b6252" }}>WHO YOU BECAME</div>
      <div style={{ fontFamily: t.fontDisplay, fontSize: inPlate ? "2.5cqw" : "26px", letterSpacing: "1px", color: t.blood, marginTop: inPlate ? ".3cqw" : "4px" }}>
        {epithet}
      </div>
    </div>
  );

  const reflectionBlock = (inPlate) => (
    <div
      style={{
        borderLeft: `3px solid ${t.blood}`,
        padding: inPlate ? ".2cqw 0 .2cqw 1.3cqw" : "2px 0 2px 14px",
        fontSize: inPlate ? "1.18cqw" : "14px",
        lineHeight: 1.5,
        color: "#2a2620",
        fontStyle: "italic",
        textWrap: "pretty",
      }}
    >
      <p style={{ margin: inPlate ? "0 0 .8cqw" : "0 0 10px" }}>{recap}</p>
      <p style={{ margin: 0 }}>{reflection}</p>
    </div>
  );

  const recordBlock = (inPlate) =>
    recordLine && (
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: inPlate ? "0.9cqw" : "9px", letterSpacing: "2px", color: "#6b6252" }}>ADDED TO THE RECORD — </span>
        <span style={{ fontFamily: t.fontHand, fontWeight: 600, fontSize: inPlate ? "1.5cqw" : "16px", color: t.goldDark }}>{recordLine}</span>
      </div>
    );

  const shareBtn = (inPlate) => (
    <button
      onClick={onShare}
      style={{
        flex: inPlate ? 1 : undefined,
        width: inPlate ? undefined : "100%",
        border: "1px solid rgba(42,38,32,.5)",
        cursor: "pointer",
        background: "transparent",
        color: "#3c352a",
        fontFamily: t.fontBody,
        fontSize: inPlate ? "1.15cqw" : "13px",
        letterSpacing: "2px",
        padding: inPlate ? "1.1cqw" : "12px",
        borderRadius: "2px",
      }}
    >
      {shareLabel}
    </button>
  );

  const againBtn = (inPlate) => (
    <button
      className="bdh-press"
      onClick={onAgain}
      style={{
        flex: inPlate ? 1.35 : undefined,
        width: inPlate ? undefined : "100%",
        border: "none",
        cursor: "pointer",
        background: t.blood,
        color: t.paper,
        fontFamily: t.fontBody,
        letterSpacing: "3px",
        padding: inPlate ? ".8cqw 1cqw .7cqw" : "13px 16px 12px",
        borderRadius: "2px",
        boxShadow: "0 4px 0 #7f1d1d",
      }}
    >
      <span style={{ fontSize: inPlate ? "1.5cqw" : "18px", display: "block" }}>PLAY AGAIN</span>
      <span
        style={{
          fontFamily: t.fontHand,
          fontWeight: 500,
          fontSize: inPlate ? "1.25cqw" : "15px",
          letterSpacing: ".5px",
          display: "block",
          marginTop: inPlate ? ".1cqw" : "2px",
          opacity: 0.85,
        }}
      >
        The road doesn't end. It waits.
      </span>
    </button>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 12px 20px", animation: "bdhFadeUp .5s ease both" }}>
      {/* ——— ≥721px: one journal page, everything on the plate ——— */}
      <div
        className="bdh-plate-only"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1120px",
          margin: "0 auto",
          aspectRatio: "1024 / 796",
          backgroundImage: "url(/ending-bg.jpg)",
          backgroundSize: "100% 100%",
          containerType: "inline-size",
          borderRadius: "4px",
          boxShadow: "0 18px 40px -18px rgba(0,0,0,.6)",
        }}
      >
        {/* Headline — live text only; the plate has no baked title. */}
        <div style={{ position: "absolute", left: "26%", width: "48%", top: "6.4cqw", textAlign: "center" }}>
          <div style={{ fontFamily: t.fontDisplay, fontSize: "4.6cqw", lineHeight: 1, letterSpacing: ".18cqw", color: t.ink }}>{headline}</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: ".7cqw", marginTop: ".9cqw" }}>
            <span style={{ fontFamily: t.fontBody, fontSize: "5.6cqw", lineHeight: 1, color: t.blood }}>{day}</span>
            <span style={{ fontFamily: t.fontBody, fontSize: "1.7cqw", letterSpacing: ".3cqw", color: t.ink }}>DAYS</span>
          </div>
          <div style={{ fontFamily: t.fontBody, fontSize: "1.2cqw", letterSpacing: ".25cqw", color: "#6b6252", marginTop: "1cqw" }}>{subtitle}</div>
        </div>

        {/* Ending-specific margin note — live text only, per ending. */}
        <div
          style={{
            position: "absolute",
            left: "71%",
            top: "14.5cqw",
            width: "18.5%",
            transform: "rotate(-2.5deg)",
            fontFamily: t.fontHand,
            fontWeight: 500,
            fontSize: "1.5cqw",
            lineHeight: 1.4,
            color: "#4a3626",
            textAlign: "center",
          }}
        >
          {note}
        </div>

        {/* The page's flowing content column. Normal flow (not absolute) so
            a long reflection grows the page rather than colliding. */}
        <div
          style={{
            marginLeft: "26%",
            width: "48%",
            paddingTop: "19.5cqw",
            paddingBottom: "3cqw",
            display: "flex",
            flexDirection: "column",
            gap: "1.05cqw",
          }}
        >
          <div style={{ alignSelf: "center", width: "58%", aspectRatio: "3 / 2" }}>
            <EndingPicture endingId={endingId} died={died} label={rEnding} />
          </div>
          <StatGrid rows={statRows} inPlate />
          <div style={{ marginTop: ".4cqw" }}>{whoYouBecame(true)}</div>
          {reflectionBlock(true)}
          {recordBlock(true)}
          <div style={{ display: "flex", gap: "1cqw", marginTop: ".3cqw" }}>
            {shareBtn(true)}
            {againBtn(true)}
          </div>
        </div>
      </div>

      {/* ——— <721px: same content, single column on plain paper ——— */}
      <div className="bdh-flow-only" style={{ width: "100%", maxWidth: "520px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <div style={{ fontFamily: t.fontDisplay, fontSize: "38px", lineHeight: 1, letterSpacing: "1px", color: t.ink }}>{headline}</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
            <span style={{ fontFamily: t.fontBody, fontSize: "52px", lineHeight: 1, color: t.blood }}>{day}</span>
            <span style={{ fontFamily: t.fontBody, fontSize: "15px", letterSpacing: "2px", color: t.ink }}>DAYS</span>
          </div>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: t.muted, marginTop: "8px" }}>{subtitle}</div>
        </div>
        <div style={{ width: "88%", aspectRatio: "3 / 2", margin: "14px auto 2px" }}>
          <EndingPicture endingId={endingId} died={died} label={rEnding} />
        </div>
        <div
          style={{
            fontFamily: t.fontHand,
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: 1.35,
            color: "#4a3626",
            textAlign: "center",
            margin: "0 auto 6px",
            width: "80%",
          }}
        >
          {note}
        </div>
        <StatGrid rows={statRows} />
        <div style={{ marginTop: "14px" }}>{whoYouBecame(false)}</div>
        <div style={{ marginTop: "14px" }}>{reflectionBlock(false)}</div>
        {recordLine && <div style={{ marginTop: "12px" }}>{recordBlock(false)}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
          {shareBtn(false)}
          {againBtn(false)}
        </div>
      </div>
    </div>
  );
}
