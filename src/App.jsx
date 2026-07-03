import { useEffect, useRef, useState } from "react";
import * as t from "./styles/tokens.js";
import { DRAFT } from "./data/items.js";
import { EVENTS } from "./data/events.js";
import { diff } from "./engine/difficulty.js";
import { shuffleFour, applyCardPick, contributorsForStat } from "./engine/draft.js";
import { rollD10, resolveCheck, applyResult, sampleRunEvents } from "./engine/events.js";
import { tier, unlockAchievements } from "./engine/scoring.js";
import { buildShareText, copyShareText, SHARE_LABEL_DEFAULT, SHARE_LABEL_COPIED, SHARE_LABEL_RESET_MS } from "./engine/sharing.js";

import Ribbon from "./components/Ribbon.jsx";
import DiceOverlay from "./components/DiceOverlay.jsx";
import ConditionBar from "./components/ConditionBar.jsx";
import ProgressTrail from "./components/ProgressTrail.jsx";
import Title from "./screens/Title.jsx";
import Draft from "./screens/Draft.jsx";
import Events from "./screens/Events.jsx";
import Results from "./screens/Results.jsx";
import Leaderboard from "./screens/Leaderboard.jsx";
import Achievements from "./screens/Achievements.jsx";

// These were editor "props" (data-props) on the original DCLogic component.
// The source has no settings UI, so they're pinned here as constants —
// per the porting brief, defaults match the original's declared defaults.
const DIFFICULTY = "Balanced"; // Merciful | Balanced | Brutal
const DRAFT_LAYOUT = "Grid Compare"; // Grid Compare | Fanned Hand | Pack Reveal
const REDUCE_MOTION = false;

const ROLL_DELAY_MS = REDUCE_MOTION ? 260 : 650;
const PICK_DELAY_MS = 620;
const DICE_TICK_MS = REDUCE_MOTION ? 260 : 65;
const DICE_TOTAL_MS = REDUCE_MOTION ? 320 : 700;

// How many non-final events a single run draws from the pool (plus the
// final event, always last). See sampleRunEvents() in engine/events.js.
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
    log: [],
    ending: null,
    died: false,
    gameOver: false,
    runClutch: false,
    runFailed: false,
    newAch: 0,
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
      setState((prev) => ({ ...prev, best, played, ach }));
    } catch (e) {}
  }, []);

  // ---------- nav ----------
  const onTabSurvival = () => setState((prev) => ({ ...prev, tab: "survival" }));
  const onTabLeader = () => setState((prev) => ({ ...prev, tab: "leaderboard" }));
  const onTabAch = () => setState((prev) => ({ ...prev, tab: "achievements" }));

  // ---------- draft flow ----------
  const onPlay = () => {
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

  const onRoll = () => {
    if (state.draftPhase !== "idle") return;
    setState((prev) => ({ ...prev, draftPhase: "rolling" }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, draftPhase: "revealed", draftCards: shuffleFour(DRAFT[prev.draftRound].cards) }));
    }, ROLL_DELAY_MS);
  };

  const onReroll = () => {
    if (state.draftPhase !== "revealed" || state.respins <= 0) return;
    setState((prev) => ({ ...prev, draftPhase: "rolling", respins: prev.respins - 1 }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, draftPhase: "revealed", draftCards: shuffleFour(DRAFT[prev.draftRound].cards) }));
    }, ROLL_DELAY_MS);
  };

  const onPickCard = (card) => {
    if (state.pickedId) return;
    setState((prev) => ({ ...prev, pickedId: card.id }));
    setTimeout(() => {
      setState((prev) => {
        const updated = applyCardPick(prev, card);
        if (prev.draftRound < DRAFT.length - 1) {
          return { ...prev, draftRound: prev.draftRound + 1, draftPhase: "idle", draftCards: [], pickedId: null, ...updated };
        }
        const runEvents = sampleRunEvents(EVENTS, MIN_RUN_EVENTS + Math.floor(Math.random() * (MAX_RUN_EVENTS - MIN_RUN_EVENTS + 1)));
        return {
          ...prev,
          screen: "event",
          eventIndex: 0,
          runEvents,
          draftPhase: "idle",
          draftCards: [],
          pickedId: null,
          ...updated,
          day: 0,
          log: [],
          ending: null,
          died: false,
          gameOver: false,
          runClutch: false,
          runFailed: false,
          newAch: 0,
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
    if (choice.check) {
      startDice(choice);
      return;
    }
    setState((prev) => {
      const applied = applyResult(prev, choice.result, DIFFICULTY);
      return {
        ...prev,
        day: applied.day,
        hp: applied.hp,
        died: applied.died,
        ending: applied.ending,
        gameOver: applied.gameOver,
        log: [...prev.log, applied.logEntry],
        reacting: true,
        reaction: choice.result,
      };
    });
    setTimeout(finishOrAdvance, REACTION_MS);
  };

  const startDice = (choice) => {
    const contributors = contributorsForStat(state.loadout, choice.check.stat);
    setState((prev) => ({ ...prev, showDice: true, dice: { phase: "rolling", roll: 1, label: choice.check.label, contributors } }));
    diceTimerRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, dice: { ...prev.dice, roll: rollD10() } }));
    }, DICE_TICK_MS);
    setTimeout(() => {
      clearInterval(diceTimerRef.current);
      setState((prev) => {
        const { roll, bonus, needed, total, success } = resolveCheck(choice.check, prev.stats, DIFFICULTY);
        const res = success ? choice.success : choice.fail;
        const applied = applyResult(prev, res, DIFFICULTY);
        return {
          ...prev,
          day: applied.day,
          hp: applied.hp,
          died: applied.died,
          ending: applied.ending,
          gameOver: applied.gameOver,
          log: [...prev.log, applied.logEntry],
          dice: { phase: "done", roll, bonus, total, needed, success, label: choice.check.label, contributors, msg: res.msg, tag: res.tag },
          runClutch: prev.runClutch || (success && needed >= 10),
          runFailed: prev.runFailed || !success,
        };
      });
    }, DICE_TOTAL_MS);
  };

  // Shared by the dice CONTINUE button and the trait/plain auto-advance
  // timer. Reads stateRef (not the `state` closure) so it's correct even
  // when fired from a setTimeout scheduled several renders ago.
  const finishOrAdvance = () => {
    const cur = stateRef.current;
    if (cur.gameOver) {
      finish(cur);
      return;
    }
    const ni = cur.eventIndex + 1;
    if (ni >= cur.runEvents.length) {
      finish(cur);
      return;
    }
    setState((prev) => ({ ...prev, eventIndex: ni, showDice: false, dice: null, reacting: false, reaction: null }));
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
    try {
      localStorage.setItem("bdh_best", String(best));
      localStorage.setItem("bdh_played", String(played));
      localStorage.setItem("bdh_ach", JSON.stringify(ach));
    } catch (e) {}
    setState((prev) => ({ ...prev, screen: "results", played, best, ach, newAch, showDice: false, dice: null, reacting: false, reaction: null }));
  };

  const onShare = () => {
    const text = buildShareText({ day: state.day, died: state.died, ending: state.ending });
    copyShareText(text);
    setState((prev) => ({ ...prev, shareLabel: SHARE_LABEL_COPIED }));
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
        <Ribbon tab={state.tab} onTabSurvival={onTabSurvival} onTabLeader={onTabLeader} onTabAch={onTabAch} onExitToTitle={onExitToTitle} />

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
                  onRoll={onRoll}
                  onReroll={onReroll}
                  onPickCard={onPickCard}
                />
              )}
              {state.screen === "event" && (
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                  {/* Persistent header: stays visible above the dice overlay (which only
                      covers the body below) so the condition reaction is never hidden
                      behind a modal — the hit has to be seen landing, not just implied. */}
                  <div style={{ padding: "16px 22px 0", borderBottom: `1px solid ${t.borderSubtle}`, paddingBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "12px", letterSpacing: "2px", color: t.muted }}>
                        DAY <span style={{ color: t.ink, fontSize: "16px" }}>{state.day}</span>
                      </div>
                      <ConditionBar hp={state.hp} hpMax={state.hpMax} />
                    </div>
                    <ProgressTrail current={state.eventIndex} total={state.runEvents.length} />
                  </div>
                  <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    <Events event={currentEvent} traits={state.traits} difficulty={DIFFICULTY} reacting={state.reacting} reaction={state.reaction} onChoose={chooseOption} />
                    <DiceOverlay show={state.showDice} dice={state.dice} onContinue={onContinue} />
                  </div>
                </div>
              )}
              {state.screen === "results" && (
                <Results
                  died={state.died}
                  day={state.day}
                  tier={currentTier}
                  ending={state.ending}
                  newAch={state.newAch}
                  loadout={state.loadout}
                  log={state.log}
                  shareLabel={state.shareLabel}
                  onShare={onShare}
                  onAgain={onAgain}
                />
              )}
            </>
          )}

          {state.tab === "leaderboard" && <Leaderboard best={state.best} />}
          {state.tab === "achievements" && <Achievements unlocked={state.ach} />}
        </div>
      </div>
    </div>
  );
}
