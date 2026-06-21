// Lightweight UI sound effects synthesized with the Web Audio API (no asset
// files). The AudioContext is created lazily on first use so it starts only
// after a real user gesture (arrow key / click), satisfying autoplay policies.

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

// "Swipe" — a soft, gentle swoosh. Shaped white noise runs through a narrow
// bandpass that glides upward (the "swipe"), with a smooth bell envelope and a
// low peak volume so it reads as an airy, soft swish rather than a sharp hiss.
// Played when the selection/focus moves between tiles or list items via arrows.
export function playNav(): void {
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  const dur = 0.18

  const len = Math.floor(ac.sampleRate * dur)
  const buffer = ac.createBuffer(1, len, ac.sampleRate)
  const data = buffer.getChannelData(0)
  // Bell-shaped (raised-cosine) noise so there are no clicks at start/end.
  for (let i = 0; i < len; i++) {
    const env = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / len)
    data[i] = (Math.random() * 2 - 1) * env
  }

  const src = ac.createBufferSource()
  src.buffer = buffer

  // A gentle band of noise sweeping up gives a soft "swish" without harsh highs.
  const bandpass = ac.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.Q.value = 0.8
  bandpass.frequency.setValueAtTime(900, now)
  bandpass.frequency.exponentialRampToValueAtTime(2600, now + dur)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)

  src.connect(bandpass)
  bandpass.connect(gain)
  gain.connect(ac.destination)
  src.start(now)
  src.stop(now + dur)
}
// "Woof" — a short dog bark. A buzzy sawtooth snaps down in pitch (the "wo→of"
// contour) under a fast two-stage envelope, with a low-pass to keep it round and
// woofy rather than harsh. Played when a popup/dialog is closed (e.g. Esc).
export function playWoof(): void {
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  const dur = 0.18

  const osc = ac.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(260, now)
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.04)
  osc.frequency.exponentialRampToValueAtTime(150, now + dur)

  const lowpass = ac.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.setValueAtTime(1600, now)
  lowpass.frequency.exponentialRampToValueAtTime(700, now + dur)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)

  osc.connect(lowpass)
  lowpass.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + dur)
}
