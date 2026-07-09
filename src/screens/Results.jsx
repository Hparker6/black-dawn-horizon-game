import * as t from "../styles/tokens.js";
import { ENDINGS, ENDING_RECAPS, GENERIC_DEATH_RECAP, GENERIC_SURVIVAL_RECAP, endingArt } from "../data/endings.js";
import { getEndingReflection, getIdentityEpithet } from "../engine/character-profile.js";
import { routeModifier } from "../engine/pacing.js";

// One labeled line of the journal's cover plate — small typewritten label,
// handwritten value, like a form filled in by the survivor themselves.
function CoverRow({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "9px 12px", borderBottom: `1px dashed ${t.borderDashed}` }}>
      <span style={{ fontSize: "9px", letterSpacing: "2px", color: t.muted }}>{label}</span>
      <span style={{ fontFamily: t.fontHand, fontWeight: 600, fontSize: "18px", lineHeight: 1.15, color: "#2a2620" }}>{value}</span>
    </div>
  );
}

// Sprint 1: the results screen is the cover page of the player's completed
// journal — identity first (Weapon / Companion / Keepsake / Route), then
// Days, Ending, and Who You Became. No stats, no loadout chips, no RPG
// numbers; the tier badge stays as a small archival stamp, not a score.
//
// Sprint 3: closing a completed novel — the ending's own inked plate
// (data/endings.js ENDING_ART) crowns the page, the record includes the
// best run, and anything unlocked this run reads as a quiet archival note,
// not a celebration banner.
export default function Results({ died, day, best, tier, endingId, newAch, newEnding, characterProfile, identity, route, shareLabel, onShare, onAgain }) {
  const headline = died ? "YOU DIED" : "YOU SURVIVED";
  const headColor = died ? t.blood : t.green;
  const endingMeta = endingId ? ENDINGS.find((e) => e.id === endingId) : null;
  const rEnding = endingMeta ? endingMeta.label : died ? "Died on the road" : "Reached the Coast";
  const hasNewAch = newAch > 0;

  // Each ending owns its own coherent recap (data/endings.js, keyed by the
  // stable endingId). The `known.died === died` check is the safety net: if
  // a data mistake ever paired a survival recap with `died:true` (or vice
  // versa), this falls back to the generic recap rather than contradicting
  // the outcome on screen. The recap's carried "item" is the drafted weapon
  // — the one physical object every survivor identity is guaranteed to have.
  const item = identity.weapon ? identity.weapon.name.toLowerCase() : died ? "nothing" : "little";
  const known = endingId ? ENDING_RECAPS[endingId] : null;
  const recap = known && known.died === died ? known.recap(item, day) : died ? GENERIC_DEATH_RECAP(item, day) : GENERIC_SURVIVAL_RECAP(item, day);
  // Closing journal reflection + its short title form (both from
  // engine/character-profile.js, same thresholds) — who the player became,
  // independent of how the run ended.
  const reflection = getEndingReflection(characterProfile);
  const epithet = getIdentityEpithet(characterProfile);
  const routeLabel = routeModifier(route).label;

  const name = (piece) => (piece ? piece.name : "—");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 24px 24px", animation: "bdhFadeUp .5s ease both" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: t.muted }}>FINAL ENTRY</div>
        {/* The ending's own closing plate — every ending is drawn, the way a
            novel's last chapter gets its final illustration. */}
        <div
          role="img"
          aria-label={`Closing illustration: ${rEnding}`}
          style={{
            width: "min(400px, 92%)",
            margin: "14px auto 2px",
            border: "1px solid rgba(20,16,12,.45)",
            boxShadow: "0 0 0 4px #f4efe4, 0 0 0 5px rgba(20,16,12,.24)",
            borderRadius: "1px",
            background: "#f1ead9",
            padding: "10px 10px 6px",
          }}
        >
          <svg viewBox="0 0 160 90" style={{ width: "100%", display: "block" }} aria-hidden="true">
            <g
              fill="none"
              stroke="#2a2620"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: endingArt(endingId, died) }}
            />
          </svg>
        </div>
        <div style={{ fontFamily: t.fontDisplay, fontSize: "42px", lineHeight: 1, marginTop: "14px", letterSpacing: "1px", color: headColor }}>{headline}</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "8px", marginTop: "10px" }}>
          <span style={{ fontSize: "62px", lineHeight: 1, color: t.ink }}>{day}</span>
          <span style={{ fontSize: "16px", letterSpacing: "2px", color: t.muted }}>DAYS</span>
        </div>
      </div>

      {/* The cover plate: a double-ruled label pasted to the journal's
          front. Identity on top (the three picks), then route/ending, then
          who the road turned you into. */}
      <div style={{ border: `1px solid ${t.borderSubtle}`, boxShadow: `0 0 0 3px ${t.paper}, 0 0 0 4px ${t.borderSubtle}`, borderRadius: "2px", background: "rgba(255,252,244,.55)", margin: "22px 2px 18px" }}>
        <div style={{ textAlign: "center", fontSize: "10px", letterSpacing: "3px", color: t.muted, padding: "10px 12px 4px" }}>
          THIS JOURNAL BELONGED TO A SURVIVOR WHO CARRIED
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px dashed ${t.borderDashed}`, marginTop: "6px" }}>
          <CoverRow label="WEAPON" value={name(identity.weapon)} />
          <CoverRow label="COMPANION" value={name(identity.companion)} />
          <CoverRow label="KEEPSAKE" value={name(identity.keepsake)} />
          <CoverRow label="ROUTE" value={routeLabel ? routeLabel.charAt(0) + routeLabel.slice(1).toLowerCase() : "—"} />
          <CoverRow label="THIS RUN" value={`${day} days · ${tier}`} />
          <CoverRow label="BEST RUN" value={`${Math.max(best || 0, day)} days`} />
          {/* The ending spans the full plate width — it's the line the whole
              journal was building toward. */}
          <div style={{ gridColumn: "1 / -1" }}>
            <CoverRow label="ENDING" value={rEnding} />
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "12px 14px 14px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "2px", color: t.muted }}>WHO YOU BECAME</div>
          <div style={{ fontFamily: t.fontDisplay, fontSize: "26px", letterSpacing: "1px", color: t.goldDark, marginTop: "4px" }}>{epithet}</div>
        </div>
      </div>

      {/* Unlocked content, as one quiet archival note instead of stacked
          celebration banners — the journal recording what this run added to
          the shelf. Absent entirely when nothing new was earned. */}
      {(hasNewAch || newEnding) && (
        <div style={{ border: `1px dashed ${t.gold}`, borderRadius: "2px", background: t.highlightBg, padding: "10px 14px", marginBottom: "14px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "2px", color: t.muted }}>ADDED TO THE RECORD</div>
          <div style={{ fontFamily: t.fontHand, fontWeight: 600, fontSize: "17px", color: t.highlightText, marginTop: "3px" }}>
            {[hasNewAch ? `${newAch} new medal${newAch > 1 ? "s" : ""} earned` : null, newEnding ? `a new ending discovered — "${rEnding}"` : null]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      )}
      <div style={{ borderLeft: `3px solid ${t.blood}`, padding: "2px 0 2px 14px", fontSize: "14px", lineHeight: 1.6, color: "#2a2620", fontStyle: "italic", textWrap: "pretty", flex: 1 }}>
        <p style={{ margin: "0 0 10px" }}>{recap}</p>
        <p style={{ margin: 0 }}>{reflection}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "18px" }}>
        <button
          onClick={onShare}
          style={{ width: "100%", border: `1px solid ${t.ink}`, cursor: "pointer", background: t.paper, color: t.ink, fontFamily: t.fontBody, fontSize: "14px", letterSpacing: "2px", padding: "14px", borderRadius: "2px" }}
        >
          {shareLabel}
        </button>
        <button
          onClick={onAgain}
          style={{ width: "100%", border: "none", cursor: "pointer", background: t.ink, color: t.paper, fontFamily: t.fontBody, fontSize: "18px", letterSpacing: "3px", padding: "16px", borderRadius: "2px", boxShadow: "0 4px 0 #000" }}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
