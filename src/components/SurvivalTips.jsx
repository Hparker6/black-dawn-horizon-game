import { useEffect, useRef, useState } from "react";
import * as t from "../styles/tokens.js";
import { SURVIVAL_TIPS } from "../data/survivalTips.js";

const CYCLE_MS = 5200;
const FADE_MS = 450;

// Small taped scrap on the notebook's right page — cycles through flavor
// tips like a loading-screen hint, never gameplay-critical. Picks a random
// start index per mount so repeat visits to the home screen don't always
// open on the same tip, then advances in order from there.
export default function SurvivalTips() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * SURVIVAL_TIPS.length));
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % SURVIVAL_TIPS.length);
        setVisible(true);
      }, FADE_MS);
    }, CYCLE_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: "clamp(8px,1.1vw,11px)", letterSpacing: "1.5px", color: t.muted, fontFamily: t.fontBody, marginBottom: "4%" }}>
        FIELD NOTES
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <p
          style={{
            margin: 0,
            fontFamily: t.fontHand,
            fontSize: "clamp(13px,2vw,19px)",
            lineHeight: 1.25,
            color: "#2a2013",
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
        >
          {SURVIVAL_TIPS[index]}
        </p>
      </div>
    </div>
  );
}
