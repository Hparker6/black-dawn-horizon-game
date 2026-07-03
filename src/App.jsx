import { useEffect, useRef, useState } from "react";
import * as t from "./styles/tokens.js";
import { DRAFT } from "./data/items.js";
import { EVENTS } from "./data/events.js";
import { diff } from "./engine/difficulty.js";
import { shuffleFour, applyCardPick, contributorsForStat } from "./engine/draft.js";
import { rollD10, resolveCheck, applyResult, pickNextEvent } from "./engine/events.js";
import { tier, unlockAchievements } from "./engine/scoring.js";
import { ENDINGS, SECRET_ENDINGS } from "./data/endings.js";
import { shareRun, SHARE_LABEL_DEFAULT, SHARE_LABEL_SHARED, SHARE_LABEL_COPIED, SHARE_LABEL_RESET_MS } from "./engine/sharing.js";
import { trackEvent } from "./engine/analytics.js";

import Ribbon from "./components/Ribbon.jsx";
import DiceOverlay from "./components/DiceOverlay.jsx";
import ConditionBar from "./components/ConditionBar.jsx";
import LoadoutStrip from "./components/LoadoutStrip.jsx";
import ProgressTrail from "./components/ProgressTrail.jsx";
import Title from "./screens/Title.jsx";
import Draft from "./screens/Draft.jsx";
import Events from "./screens/Events.jsx";
import Results from "./screens/Results.jsx";
import Leaderboard from "./screens/Leaderboard.jsx";
import Achievements from "./screens/Achievements.jsx";
import EndingsCollection from "./screens/EndingsCollection.jsx";

// These were editor "props" (data-props) on the original DCLogic component.
// The source has no settings UI, so they're pinned here as constants —
// per the porting brief, defaults match the original's declared defaults.
const DIFFICULTY = "Balanced"; // Merciful | Balanced | Brutal
const DRAFT_LAYOUT = "Grid Compare"; // Grid Compare | Fanned Hand | Pack Reveal
const REDUCE_MOTION = false;

// Draft "rolling" duration: long enough for the shuffle animation in
// Draft.jsx (cycling faces, staggered per-slot settle) to play out before
// the phase flips to "revealed". Shortened under reduceMotion to a quick
// settle rather than the full shuffle.
const ROLL_DELAY_MS = REDUCE_MOTION ? 300 : 1350;
const PICK_DELAY_MS = 620;
const DICE_TICK_MS = REDUCE_MOTION ? 260 : 65;
const DICE_TOTAL_MS = REDUCE_MOTION ? 320 : 700;

// How many non-final events a single run targets from the pool (plus the
// final event, always last). The run doesn't draw this list up front — see
// pickNextEvent() in engine/events.js — it's just the countdown that tells
// pickNextEvent when to stop offering non-final events and hand back "The
// Signal" instead.
const MIN_RUN_EVENTS = 12;
const MAX_RUN_EVENTS = 15;

// How long the inline reaction (message/tag/day/condition) stays on screen
// for an instant trait/plain choice before auto-advancing. Long enough to
// read a short line, short enough that it never feels like a second click
// is owed.
const REACTION_MS = 1300;

function initialState() {
  return {
    tab: "survival",
    screen: "title",
    best: 0,
    played: 0,
    ach: [],
    endingsFound: [],
    draftRound: 0,
    draftPhase: "idle",
    draftCards: [],
    pickedId: null,
    respins: 1,
    stats: { combat: 0, survival: 0, wits: 0 },
    traits: [],
    loadout: [],
    hpMax: 8,
    hp: 8,
    day: 0,
    eventIndex: 0,
    runEvents: [],
    runEventsTarget: 0,
    // Consequences set by choices that persist for the rest of the run —
    // see engine/flags.js. Gates later choices/events, and picks up
    // callback events mid-run the moment their flags are satisfied (see
    // pickNextEvent in engine/events.js).
    flags: [],
    log: [],
    ending: null,
    died: false,
    gameOver: false,
    runClutch: false,
    runFailed: false,
    newAch: 0,
    newEnding: false,
    showDice: false,
    dice: null,
    reacting: false,
    reaction: null,
    shareLabel: SHARE_LABEL_DEFAULT,
  };
}

export default function App() {
  const [state, setState] = useState(initialState);
  const diceTimerRef = useRef(null);
  // Lets timeout-driven continuations (the reaction auto-advance) read the
  // freshest committed state instead of the stale closure from whichever
  // render scheduled the timeout.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const best = +localStorage.getItem("bdh_best") || 0;
      const played = +localStorage.getItem("bdh_played") || 0;
      const ach = JSON.parse(localStorage.getItem("bdh_ach") || "[]");
      const endingsFound = JSON.parse(localStorage.getItem("bdh_endings") || "[]");
      setState((prev) => ({ ...prev, best, played, ach, endingsFound }));
    } catch (e) {}
  }, []);

  // ---------- nav ----------
  const onTabSurvival = () => setState((prev) => ({ ...prev, tab: "survival" }));
  const onTabLeader = () => setState((prev) => ({ ...prev, tab: "leaderboard" }));
  const onTabAch = () => setState((prev) => ({ ...prev, tab: "achievements" }));
  const onTabEndings = () => setState((prev) => ({ ...prev, tab: "endings" }));

  // ---------- draft flow ----------
  const onPlay = () => {
    trackEvent("run_started", { difficulty: DIFFICULTY });
    const m = diff(DIFFICULTY);
    setState((prev) => ({
      ...prev,
      tab: "survival",
      screen: "spin",
      draftRound: 0,
      draftPhase: "idle",
      draftCards: [],
      pickedId: null,
      respins: 1,
      stats: { combat: 0, survival: 0, wits: 0 },
      traits: [],
      loadout: [],
      flags: [],
      hpMax: 8 + m.hp,
      hp: 8 + m.hp,
    }));
  };

  // Abandons the in-progress run (no localStorage write, no achievement/best
  // update — that only happens via finish()) and returns to the title screen.
  const onExitToTitle = () => {
    clearInterval(diceTimerRef.current);
    setState((prev) => ({ ...prev, tab: "survival", screen: "title", showDice: false, dice: null, reacting: false, reaction: null }));
  };

  // The actual 4 cards are decided immediately (not at the end of the delay)
  // so Draft.jsx's shuffle animation can cycle toward the real outcome and
  // have each slot settle on it before "revealed" flips — no last-instant
  // swap once the phase transitions.
  const onRoll = () => {
    if (state.draftPhase !== "idle") return;
    const draftCards = shuffleFour(DRAFT[state.draftRound].cards);
    setState((prev) => ({ ...prev, draftPhase: "rolling", draftCards }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, draftPhase: "revealed" }));
    }, ROLL_DELAY_MS);
  };

  const onReroll = () => {
    if (state.draftPhase !== "revealed" || state.respins <= 0) return;
    const draftCards = shuffleFour(DRAFT[state.draftRound].cards);
    setState((prev) => ({ ...prev, draftPhase: "rolling", respins: prev.respins - 1, draftCards }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, draftPhase: "revealed" }));
    }, ROLL_DELAY_MS);
  };

  const onPickCard = (card) => {
    if (state.pickedId) return;
    trackEvent("draft_card_selected", {
      round: state.draftRound + 1,
      category: DRAFT[state.draftRound].cat,
      card_id: card.id,
      card_name: card.name,
      trait: card.trait || "none",
    });
    setState((prev) => ({ ...prev, pickedId: card.id }));
    setTimeout(() => {
      setState((prev) => {
        const updated = applyCardPick(prev, card);
        if (prev.draftRound < DRAFT.length - 1) {
          return { ...prev, draftRound: prev.draftRound + 1, draftPhase: "idle", draftCards: [], pickedId: null, ...updated };
        }
        const runEventsTarget = MIN_RUN_EVENTS + Math.floor(Math.random() * (MAX_RUN_EVENTS - MIN_RUN_EVENTS + 1));
        const firstEvent = pickNextEvent({ allEvents: EVENTS, usedTitles: [], flags: [], remainingSlots: runEventsTarget });
        return {
          ...prev,
          screen: "event",
          eventIndex: 0,
          runEvents: [firstEvent],
          runEventsTarget,
          draftPhase: "idle",
          draftCards: [],
          pickedId: null,
          ...updated,
          day: 0,
          log: [],
          flags: [],
          ending: null,
          died: false,
          gameOver: false,
          runClutch: false,
          runFailed: false,
          newAch: 0,
          newEnding: false,
          showDice: false,
          dice: null,
          reacting: false,
          reaction: null,
          shareLabel: SHARE_LABEL_DEFAULT,
        };
      });
    }, PICK_DELAY_MS);
  };

  // ---------- events ----------
  // Trait/plain choices resolve the instant they're picked — no second
  // "acknowledge" tap. The result applies immediately (so the condition bar
  // reacts in the same beat), an inline reaction shows in place of the
  // choice list, and the event auto-advances after REACTION_MS. Dice checks
  // still route through startDice()/DiceOverlay, which keeps its own
  // deliberate CONTINUE tap — that pause is the dramatic beat, not dead
  // weight.
  const chooseOption = (choice, locked) => {
    if (locked) return;
    const eventTitle = (state.runEvents[state.eventIndex] || {}).title;
    if (choice.check) {
      startDice(choice, eventTitle);
      return;
    }
    const applied = applyResult(state, choice.result, DIFFICULTY, SECRET_ENDINGS);
    trackEvent("choice_selected", {
      event_title: eventTitle,
      choice_text: choice.text,
      choice_kind: choice.requiredTrait ? "trait" : "plain",
      resulted_in_death: applied.died,
      set_flags: choice.result.setFlags || [],
    });
    setState((prev) => ({
      ...prev,
      day: applied.day,
      hp: applied.hp,
      died: applied.died,
      ending: applied.ending,
      gameOver: applied.gameOver,
      flags: applied.flags,
      log: [...prev.log, applied.logEntry],
      reacting: true,
      reaction: choice.result,
    }));
    setTimeout(finishOrAdvance, REACTION_MS);
  };

  const startDice = (choice, eventTitle) => {
    const contributors = contributorsForStat(state.loadout, choice.check.stat);
    setState((prev) => ({ ...prev, showDice: true, dice: { phase: "rolling", roll: 1, label: choice.check.label, contributors } }));
    diceTimerRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, dice: { ...prev.dice, roll: rollD10() } }));
    }, DICE_TICK_MS);
    setTimeout(() => {
      clearInterval(diceTimerRef.current);
      // Resolved outside the setState updater (reading stateRef, not `prev`)
      // so trackEvent — a side effect — never risks double-firing under
      // StrictMode's dev-only double-invocation of updater functions.
      const cur = stateRef.current;
      const { roll, bonus, needed, total, success } = resolveCheck(choice.check, cur.stats, DIFFICULTY);
      const res = success ? choice.success : choice.fail;
      const applied = applyResult(cur, res, DIFFICULTY, SECRET_ENDINGS);
      trackEvent("choice_selected", {
        event_title: eventTitle,
        choice_text: choice.text,
        choice_kind: "check",
        check_stat: choice.check.stat,
        check_success: success,
        resulted_in_death: applied.died,
        set_flags: res.setFlags || [],
      });
      setState((prev) => ({
        ...prev,
        day: applied.day,
        hp: applied.hp,
        died: applied.died,
        ending: applied.ending,
        gameOver: applied.gameOver,
        flags: applied.flags,
        log: [...prev.log, applied.logEntry],
        dice: { phase: "done", roll, bonus, total, needed, success, label: choice.check.label, contributors, msg: res.msg, tag: res.tag },
        runClutch: prev.runClutch || (success && needed >= 10),
        runFailed: prev.runFailed || !success,
      }));
    }, DICE_TOTAL_MS);
  };

  // Shared by the dice CONTINUE button and the trait/plain auto-advance
  // timer. Reads stateRef (not the `state` closure) so it's correct even
  // when fired from a setTimeout scheduled several renders ago. Picks the
  // next event live, against the run's current flags — a callback event
  // that just became eligible (because the choice that resolved a moment
  // ago set its flag) is simply one of the options pickNextEvent can now
  // draw, no separate "unlock" step required.
  const finishOrAdvance = () => {
    const cur = stateRef.current;
    if (cur.gameOver) {
      finish(cur);
      return;
    }
    const usedTitles = cur.runEvents.map((e) => e.title);
    const playedNonFinal = cur.runEvents.filter((e) => !e.final).length;
    const remainingSlots = cur.runEventsTarget - playedNonFinal;
    const next = pickNextEvent({ allEvents: EVENTS, usedTitles, flags: cur.flags, remainingSlots });
    setState((prev) => ({
      ...prev,
      runEvents: [...prev.runEvents, next],
      eventIndex: prev.eventIndex + 1,
      showDice: false,
      dice: null,
      reacting: false,
      reaction: null,
    }));
  };

  const onContinue = () => finishOrAdvance();

  const finish = (snapshot = stateRef.current) => {
    const played = snapshot.played + 1;
    const best = Math.max(snapshot.best, snapshot.day);
    const { ach, newAch } = unlockAchievements({
      ach: snapshot.ach,
      day: snapshot.day,
      died: snapshot.died,
      ending: snapshot.ending,
      runClutch: snapshot.runClutch,
      runFailed: snapshot.runFailed,
    });
    // Endings Collection tracking: any named ending this run landed on
    // (whether a base one from the final event's dice/trait choice, or a
    // secret one resolved via flags) gets marked discovered. The generic
    // fallback death (ending stays null — died anywhere but the final
    // event) has no stable id in ENDINGS, so it's never tracked here; the
    // collection is for named endings specifically.
    const matchedEnding = snapshot.ending ? ENDINGS.find((e) => e.label === snapshot.ending) : null;
    const newEnding = !!matchedEnding && !snapshot.endingsFound.includes(matchedEnding.id);
    const endingsFound = matchedEnding ? Array.from(new Set([...snapshot.endingsFound, matchedEnding.id])) : snapshot.endingsFound;
    // days_survived/ending_reached/highest_day live as parameters on this one
    // event rather than separate hits — GA4's Explore reports break down and
    // average event parameters directly, so "average days survived" or "most
    // common ending" is just a report on run_finished, not a new event type.
    trackEvent("run_finished", {
      days_survived: snapshot.day,
      ending: snapshot.ending || (snapshot.died ? "Died" : "Reached the Coast"),
      tier: tier({ died: snapshot.died, day: snapshot.day }),
      died: snapshot.died,
      difficulty: DIFFICULTY,
      is_new_best: snapshot.day > snapshot.best,
      new_achievements: newAch,
      new_ending: newEnding,
    });
    try {
      localStorage.setItem("bdh_best", String(best));
      localStorage.setItem("bdh_played", String(played));
      localStorage.setItem("bdh_ach", JSON.stringify(ach));
      localStorage.setItem("bdh_endings", JSON.stringify(endingsFound));
    } catch (e) {}
    setState((prev) => ({ ...prev, screen: "results", played, best, ach, newAch, endingsFound, newEnding, showDice: false, dice: null, reacting: false, reaction: null }));
  };

  const onShare = async () => {
    const result = await shareRun({ day: state.day, died: state.died, ending: state.ending, loadout: state.loadout });
    // A cancelled share sheet isn't a failure — the user backed out on
    // purpose, so there's nothing to confirm and no clipboard fallback to run.
    if (result.method === "cancelled") return;
    const label = result.method === "share" ? SHARE_LABEL_SHARED : SHARE_LABEL_COPIED;
    setState((prev) => ({ ...prev, shareLabel: label }));
    setTimeout(() => setState((prev) => ({ ...prev, shareLabel: SHARE_LABEL_DEFAULT })), SHARE_LABEL_RESET_MS);
  };

  const onAgain = () => onPlay();

  const currentEvent = state.runEvents[state.eventIndex] || state.runEvents[0] || EVENTS[0];
  const currentTier = tier({ died: state.died, day: state.day });

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "20px 12px 40px",
        background: t.bgGradient,
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 80,
          mixBlendMode: "multiply",
          opacity: 0.06,
          backgroundImage: t.noiseOverlayBg,
        }}
      />

      <div style={{ position: "relative", width: "100%", maxWidth: "920px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Ribbon tab={state.tab} onTabSurvival={onTabSurvival} onTabLeader={onTabLeader} onTabAch={onTabAch} onTabEndings={onTabEndings} onExitToTitle={onExitToTitle} />

        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: "min(80vh,760px)",
            background: t.paper,
            color: t.ink,
            borderRadius: "2px",
            boxShadow: "0 1px 0 #fbf7ee inset, 0 30px 60px -20px rgba(0,0,0,.7)",
            backgroundImage: t.coffeeRingBg,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {state.tab === "survival" && (
            <>
              {state.screen === "title" && <Title best={state.best} played={state.played} onPlay={onPlay} />}
              {state.screen === "spin" && (
                <Draft
                  round={state.draftRound}
                  totalRounds={DRAFT.length}
                  category={DRAFT[state.draftRound]}
                  respins={state.respins}
                  phase={state.draftPhase}
                  cards={state.draftCards}
                  pickedId={state.pickedId}
                  layout={DRAFT_LAYOUT}
                  reduceMotion={REDUCE_MOTION}
                  onRoll={onRoll}
                  onReroll={onReroll}
                  onPickCard={onPickCard}
                />
              )}
              {state.screen === "event" && (
                // Ruled-paper texture spans the full wide panel — a short entry
                // still reads as "journal page with room to breathe," not dead
                // space — while the reading column itself stays narrow and
                // centered so line lengths stay comfortable regardless of frame
                // width. The margin rule is the same faint red as classic ruled
                // paper's left margin line.
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minHeight: 0,
                    backgroundImage: t.journalRuleBg,
                    backgroundSize: t.journalRuleSize,
                  }}
                >
                  <div
                    style={{
                      maxWidth: t.readingColumnWidth,
                      width: "100%",
                      margin: "0 auto",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      minHeight: 0,
                      borderLeft: "1px solid rgba(198,40,40,.14)",
                    }}
                  >
                    {/* Persistent header: stays visible above the dice overlay (which only
                        covers the body below) so the condition reaction is never hidden
                        behind a modal — the hit has to be seen landing, not just implied. */}
                    <div style={{ padding: "16px 22px 10px", borderBottom: `1px solid ${t.borderSubtle}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "12px", letterSpacing: "2px", color: t.muted }}>
                          DAY <span style={{ color: t.ink, fontSize: "16px" }}>{state.day}</span>
                        </div>
                        <ConditionBar hp={state.hp} hpMax={state.hpMax} />
                      </div>
                      <ProgressTrail current={state.eventIndex} total={state.runEventsTarget + 1} />
                    </div>
                    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                      <Events event={currentEvent} traits={state.traits} flags={state.flags} difficulty={DIFFICULTY} reacting={state.reacting} reaction={state.reaction} onChoose={chooseOption} />
                      <DiceOverlay show={state.showDice} dice={state.dice} onContinue={onContinue} />
                    </div>
                  </div>
                  {/* Outside the reading column on purpose — full panel width,
                      docked to the bottom, so it never narrows the story text
                      or competes with it. Collapsed by default either way. */}
                  <LoadoutStrip loadout={state.loadout} />
                </div>
              )}
              {state.screen === "results" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minHeight: 0,
                    backgroundImage: t.journalRuleBg,
                    backgroundSize: t.journalRuleSize,
                  }}
                >
                  <div
                    style={{
                      maxWidth: t.readingColumnWidth,
                      width: "100%",
                      margin: "0 auto",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      minHeight: 0,
                      borderLeft: "1px solid rgba(198,40,40,.14)",
                    }}
                  >
                    <Results
                      died={state.died}
                      day={state.day}
                      tier={currentTier}
                      ending={state.ending}
                      newAch={state.newAch}
                      newEnding={state.newEnding}
                      loadout={state.loadout}
                      shareLabel={state.shareLabel}
                      onShare={onShare}
                      onAgain={onAgain}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {state.tab === "leaderboard" && <Leaderboard best={state.best} />}
          {state.tab === "achievements" && <Achievements unlocked={state.ach} />}
          {state.tab === "endings" && <EndingsCollection discovered={state.endingsFound} />}
        </div>
      </div>
    </div>
  );
}
