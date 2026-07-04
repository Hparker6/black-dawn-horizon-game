import * as t from "../styles/tokens.js";
import { destinationEta } from "../engine/pacing.js";

// Atmospheric pressure alongside the day counter: an approximate countdown
// toward the run's final event, so a run reads as "racing toward rescue"
// rather than an open-ended wander. See engine/pacing.js for the estimate
// itself; this just renders it (or nothing, once ProgressTrail's own
// close-range messaging takes over).
export default function DestinationEta({ day, eventIndex, runEventsTarget }) {
  const { label } = destinationEta({ day, eventIndex, runEventsTarget });
  if (!label) return null;
  return <div style={{ marginTop: "6px", fontSize: "10px", letterSpacing: "1.5px", color: t.muted }}>{label}</div>;
}
