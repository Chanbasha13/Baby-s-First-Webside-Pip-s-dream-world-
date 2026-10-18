// ==========================================================================
// Pip's Subtle Web Audio Chimes
// Pure Web Audio: User-enabled only, no autoplay, instant resource disposal
// Reuses a single shared AudioContext with auto-suspend on idle
// ==========================================================================

let soundEnabled = false;

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
  try {
    soundEnabled = localStorage.getItem('pip_sound_enabled') === 'true';
  } catch {
    soundEnabled = false;
  }
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('pip_sound_enabled', String(soundEnabled));
    } catch {
      // Storage access blocked or quota exceeded
    }
  }
}

let sharedAudioCtx = null;
let idleSuspendTimer = null;

function scheduleIdleSuspend() {
  if (idleSuspendTimer) clearTimeout(idleSuspendTimer);
  idleSuspendTimer = setTimeout(() => {
    if (sharedAudioCtx && sharedAudioCtx.state === 'running') {
      sharedAudioCtx.suspend().catch(() => {});
    }
  }, 2500);
}

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  return sharedAudioCtx;
}

export async function initAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // Ignored
    }
  }
  return Boolean(ctx && ctx.state === 'running');
}

/**
 * Plays a tiny, delicate chime note (frequency in Hz)
 * Used for subtle UI feedback (navbar theme toggle, waypoints)
 */
export async function playGentleChime(freq = 880, duration = 0.25) {
  if (!soundEnabled || typeof window === 'undefined') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (idleSuspendTimer) {
    clearTimeout(idleSuspendTimer);
    idleSuspendTimer = null;
  }

  try {
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Ultra-soft envelope: 15ms attack, exponential decay
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);

    // Clean up audio nodes after note finishes
    setTimeout(() => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Ignored
      }
      scheduleIdleSuspend();
    }, (duration + 0.1) * 1000);
  } catch {
    // Ignore any audio context initialization errors
  }
}

/**
 * Play an Easter egg discovery arpeggio: 3 quick ascending celestial notes
 */
export function playEasterEggFanfare() {
  if (!soundEnabled) return;
  playGentleChime(659.25, 0.2); // E5
  setTimeout(() => playGentleChime(880.0, 0.2), 120); // A5
  setTimeout(() => playGentleChime(1046.5, 0.4), 240); // C6
}

/**
 * Play a dedicated musical star chime note on explicit user star tap.
 * Reuses the shared AudioContext (no new context created).
 * Separate from background lullaby and passive UI chimes toggle.
 */
export async function playStarChime(freq = 880, duration = 0.48) {
  if (typeof window === 'undefined') return false;

  const ctx = getAudioContext();
  if (!ctx) return false;

  if (idleSuspendTimer) {
    clearTimeout(idleSuspendTimer);
    idleSuspendTimer = null;
  }

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    if (ctx.state !== 'running') return false;

    const now = ctx.currentTime;

    // 1. Pure sine fundamental tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // 2. High-register bell overtone for crystalline starlight shimmer
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2.756, now); // Metallic celestial ratio

    // Fundamental envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Overtone envelope
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.linearRampToValueAtTime(0.035, now + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.5);

    osc.connect(gain);
    overtone.connect(overtoneGain);
    gain.connect(ctx.destination);
    overtoneGain.connect(ctx.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + duration + 0.05);
    overtone.stop(now + duration * 0.55);

    // Node cleanup
    setTimeout(() => {
      try {
        osc.disconnect();
        gain.disconnect();
        overtone.disconnect();
        overtoneGain.disconnect();
      } catch {
        // Ignored
      }
      scheduleIdleSuspend();
    }, (duration + 0.1) * 1000);

    return true;
  } catch {
    return false;
  }
}

/**
 * Play a delicate chime sound when catching a falling dream star in the mini-game.
 * Pitch escalates with combo level for satisfying audio feedback.
 * Respects soundEnabled mute state.
 */
export function playStarCatchSound(combo = 1) {
  if (!soundEnabled) return;
  const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
  const noteIndex = Math.min(Math.max(combo - 1, 0), scale.length - 1);
  const freq = scale[noteIndex];
  playGentleChime(freq, 0.22);
}

/**
 * Play a gentle celestial fanfare when completing a mini-game round.
 * Respects soundEnabled mute state.
 */
export function playGameVictorySound(isCelebration = false) {
  if (!soundEnabled) return;
  playGentleChime(523.25, 0.18);
  setTimeout(() => playGentleChime(659.25, 0.18), 110);
  setTimeout(() => playGentleChime(783.99, 0.18), 220);
  setTimeout(() => playGentleChime(isCelebration ? 1174.66 : 1046.5, 0.38), 330);
}

/**
 * Play a delicate celestial trill when discovering a Secret Dream Quest clue.
 * 3-note ascending celestial trill (F#5 -> A5 -> D6).
 * Respects soundEnabled mute state.
 */
export function playQuestClueSound() {
  if (!soundEnabled) return;
  playGentleChime(739.99, 0.18); // F#5
  setTimeout(() => playGentleChime(880.00, 0.18), 110); // A5
  setTimeout(() => playGentleChime(1174.66, 0.35), 220); // D6
}

/**
 * Play a rich, joyful celestial fanfare when unlocking Pip's Secret Letter.
 * 5-note melodic cadence (D5 -> F#5 -> A5 -> B5 -> D6).
 * Respects soundEnabled mute state.
 */
export function playQuestCompleteFanfare() {
  if (!soundEnabled) return;
  playGentleChime(587.33, 0.16); // D5
  setTimeout(() => playGentleChime(739.99, 0.16), 110); // F#5
  setTimeout(() => playGentleChime(880.00, 0.18), 220); // A5
  setTimeout(() => playGentleChime(987.77, 0.20), 330); // B5
  setTimeout(() => playGentleChime(1174.66, 0.55), 450); // D6
}


