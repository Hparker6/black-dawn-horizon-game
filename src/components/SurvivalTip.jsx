import { useEffect, useRef, useState } from "react";
import * as t from "../styles/tokens.js";
import { SURVIVAL_TIPS } from "../data/survivalTips.js";

const CYCLE_MS = 5200;
const FADE_MS = 450;

function step(i, delta) {
  return (i + delta + SURVIVAL_TIPS.length) % SURVIVAL_TIPS.length;
}

// The notebook home's taped-note scrap. Cycles through SURVIVAL_TIPS like a
// loading-screen hint — picks a random start index per mount so repeat
// visits don't always open on the same tip, then advances in order (with a
// crossfade, not a hard cut) from there. Also click-navigable: no arrow
// icons (would read as UI chrome on top of the photo and break the "this is
// a real note taped to a real page" illusion), so the note itself is split
// into two invisible halves — tap the left word to go back, the right word
// to go forward, same convention as a comic reader. A manual tap restarts
// the auto-cycle timer rather than just letting it keep running, so the
// tip you just chose doesn't get yanked away a moment later.
export default function SurvivalTip() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * SURVIVAL_TIPS.length));
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(1), CYCLE_MS);
  };

  const go = (delta) => {
    clearTimeout(fadeTimeoutRef.current);
    setVisible(false);
    fadeTimeoutRef.current = setTimeout(() => {
      setIndex((i) => step(i, delta));
      setVisible(true);
    }, FADE_MS);
  };

  useEffect(() => {
    startTimer();
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickedRight = e.clientX - rect.left > rect.width / 2;
    go(clickedRight ? 1 : -1);
    startTimer();
  };

  return (
    <div
      className="bdh-tip-note"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Next survival tip"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { go(1); startTimer(); }
        if (e.key === "ArrowLeft") { go(-1); startTimer(); }
        if (e.key === "ArrowRight") { go(1); startTimer(); }
      }}
    >
      <div
        style={{
          color: "#14100c",
          opacity: visible ? 0.92 : 0,
          textShadow: "0px 1px 0px rgba(255,255,255,.15)",
          transition: `opacity ${FADE_MS}ms ease`,
          fontFamily: t.fontBody,
          fontWeight: "bold",
          fontSize: "clamp(10px,1.3vw,13px)",
          letterSpacing: ".5px",
        }}
      >
        SURVIVAL TIP #{index + 1}:
      </div>
      <p
        style={{
          color: "#14100c",
          opacity: visible ? 0.92 : 0,
          textShadow: "0px 1px 0px rgba(255,255,255,.15)",
          transition: `opacity ${FADE_MS}ms ease`,
          margin: "8px 0 0",
          fontFamily: t.fontBody,
          fontSize: "clamp(10px,1.3vw,13px)",
          lineHeight: 1.4,
        }}
      >
        {SURVIVAL_TIPS[index]}
      </p>
    </div>
  );
}
