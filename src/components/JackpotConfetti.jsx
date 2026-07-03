import { useMemo } from "react";
import * as t from "../styles/tokens.js";

const COLORS = [t.blood, t.gold, t.green, t.ultraBorder, "#5078dc", t.ink];
const PIECE_COUNT = 16;

// A one-shot burst of small pieces flung outward from center, staggered
// slightly. Purely decorative — mounted briefly over a card slot the
// instant it settles on a jackpot item, then unmounted by the caller.
export default function JackpotConfetti() {
  const pieces = useMemo(() => {
    return Array.from({ length: PIECE_COUNT }, (_, i) => {
      const angle = (i / PIECE_COUNT) * Math.PI * 2 + Math.random() * 0.6;
      const dist = 34 + Math.random() * 34;
      return {
        id: i,
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
        dx: Math.round(Math.cos(angle) * dist),
        dy: Math.round(Math.sin(angle) * dist - 8),
        rot: Math.round(Math.random() * 360),
        delay: Math.round(Math.random() * 90),
      };
    });
  }, []);

  return (
    <div data-testid="jackpot-confetti" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 6 }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "6px",
            height: "6px",
            marginTop: "-3px",
            marginLeft: "-3px",
            background: p.color,
            borderRadius: p.round ? "50%" : "1px",
            "--dx": p.dx + "px",
            "--dy": p.dy + "px",
            "--rot": p.rot + "deg",
            animation: `confettiBurst .85s ease-out ${p.delay}ms both`,
          }}
        />
      ))}
    </div>
  );
}
