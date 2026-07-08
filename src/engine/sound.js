// Tiny procedural sound effects — synthesized on a shared AudioContext so
// the game ships zero audio assets. Everything here is fire-and-forget and
// swallows failures (no AudioContext, autoplay policy, etc.): sound is
// garnish, never load-bearing.
let ctx = null;

function audioContext() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = ctx || new AC();
  // Contexts start suspended until a user gesture; every caller here fires
  // from a click handler's turn, so resume() is allowed to succeed.
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// A soft paper "whoosh" for page turns (components/PageTurner.jsx): a short
// noise burst swept through a bandpass filter — rising then settling pitch
// reads as a sheet flexing through the air. Kept quiet (peak gain .09) so
// it registers as texture, not a sound effect demanding attention.
export function playPageWhoosh() {
  try {
    const ac = audioContext();
    if (!ac) return;
    const dur = 0.5;
    const noise = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ac.createBufferSource();
    src.buffer = noise;
    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.7;
    const gain = ac.createGain();

    const now = ac.currentTime;
    band.frequency.setValueAtTime(400, now);
    band.frequency.exponentialRampToValueAtTime(1800, now + dur * 0.55);
    band.frequency.exponentialRampToValueAtTime(700, now + dur);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    src.connect(band);
    band.connect(gain);
    gain.connect(ac.destination);
    src.start(now);
    src.stop(now + dur);
  } catch (e) {}
}
