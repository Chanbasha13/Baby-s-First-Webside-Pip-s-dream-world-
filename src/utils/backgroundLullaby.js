// ==========================================================================
// Pip's Dream World — Synthesized Background Lullaby
// Pure Web Audio API: 100% original music-box synthesis
// User-initiated only, seamless looping, zero external dependencies
// ==========================================================================

// 24-note original bedtime lullaby in C-major / A-minor pentatonic modal warmth
// Humanized with subtle physical tine velocities (vel: 1.0 downbeat, 0.82-0.88 offbeats)
const LULLABY_SCORE = [
  // Measure 1: Nursery Awakening
  { freq: 659.25, dur: 1.5, vel: 1.00 }, // E5 (Downbeat comb pluck)
  { freq: 783.99, dur: 1.4, vel: 0.84 }, // G5
  { freq: 1046.50, dur: 1.8, vel: 0.92 }, // C6
  // Measure 2: Starlight Drift
  { freq: 987.77, dur: 1.4, vel: 0.96 }, // B5 (Downbeat)
  { freq: 880.00, dur: 1.6, vel: 0.82 }, // A5
  { freq: 783.99, dur: 1.5, vel: 0.86 }, // G5
  // Measure 3: Velvet Clouds
  { freq: 880.00, dur: 1.5, vel: 1.00 }, // A5 (Downbeat)
  { freq: 698.46, dur: 1.4, vel: 0.84 }, // F5
  { freq: 659.25, dur: 1.8, vel: 0.88 }, // E5
  // Measure 4: Night Wind
  { freq: 587.33, dur: 1.4, vel: 0.96 }, // D5 (Downbeat)
  { freq: 783.99, dur: 1.5, vel: 0.85 }, // G5
  { freq: 987.77, dur: 1.6, vel: 0.90 }, // B5
  // Measure 5: Dream Flight
  { freq: 1046.50, dur: 1.8, vel: 1.00 }, // C6 (Downbeat peak)
  { freq: 783.99, dur: 1.5, vel: 0.85 }, // G5
  { freq: 659.25, dur: 1.6, vel: 0.88 }, // E5
  // Measure 6: Soft Whispers
  { freq: 698.46, dur: 1.4, vel: 0.94 }, // F5 (Downbeat)
  { freq: 587.33, dur: 1.5, vel: 0.84 }, // D5
  { freq: 659.25, dur: 1.8, vel: 0.88 }, // E5
  // Measure 7: Slumber Warmth
  { freq: 523.25, dur: 1.4, vel: 0.98 }, // C5 (Downbeat tonic foundation)
  { freq: 659.25, dur: 1.5, vel: 0.86 }, // E5
  { freq: 783.99, dur: 1.6, vel: 0.90 }, // G5
  // Measure 8: Pillow Haven Cadence
  { freq: 659.25, dur: 1.5, vel: 0.96 }, // E5 (Downbeat)
  { freq: 587.33, dur: 1.6, vel: 0.86 }, // D5
  { freq: 523.25, dur: 2.2, vel: 0.92 }, // C5 (Resting home note, seamless major 3rd transition to E5)
];

const NOTE_INTERVAL_MS = 740; // Calming 81 BPM 3/4 nursery rocking tempo
const STORAGE_VOL_KEY = 'pip_music_volume';
const STORAGE_USER_PAUSED_KEY = 'pip_music_user_paused';

let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let currentNoteIndex = 0;
let timerId = null;
let suspendTimer = null;
let volume = 0.45; // Default soothing nursery volume (45%)
let activeNodes = [];
let userHasExplicitlyPaused = false;
let wasPlayingBeforeHide = false;
let wakePrompt = false;
let interactionWakeCleanup = null;
const listeners = new Set();

function cleanupInteractionWake() {
  if (typeof interactionWakeCleanup === 'function') {
    interactionWakeCleanup();
    interactionWakeCleanup = null;
  }
}

function setupOneTimeInteractionWake() {
  if (typeof window === 'undefined') return;
  cleanupInteractionWake();

  const onInteraction = async () => {
    cleanupInteractionWake();
    if (!userHasExplicitlyPaused && !isPlaying) {
      await startLullaby({ isExplicitUserAction: false });
    }
  };

  window.addEventListener('pointerdown', onInteraction, { capture: true, once: true });
  window.addEventListener('keydown', onInteraction, { capture: true, once: true });
  window.addEventListener('touchstart', onInteraction, { capture: true, once: true, passive: true });

  interactionWakeCleanup = () => {
    window.removeEventListener('pointerdown', onInteraction, { capture: true });
    window.removeEventListener('keydown', onInteraction, { capture: true });
    window.removeEventListener('touchstart', onInteraction, { capture: true });
  };
}

// Load stored preferences
if (typeof window !== 'undefined') {
  try {
    const savedVol = localStorage.getItem(STORAGE_VOL_KEY);
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        volume = parsed;
      }
    }

    userHasExplicitlyPaused = localStorage.getItem(STORAGE_USER_PAUSED_KEY) === 'true';
  } catch {
    // Storage access blocked or unavailable
  }
}

function notifyListeners() {
  const state = { isPlaying, volume, wakePrompt, userHasExplicitlyPaused };
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch {
      // Ignore listener error
    }
  });
}

function ensureAudioGraph() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioCtx();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(volume, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }

  return audioCtx;
}

/**
 * Synthesize a single gentle music-box bell tine note
 */
function playMusicBoxTine(note, ctx, gainNode) {
  try {
    if (!ctx || ctx.state !== 'running' || !gainNode) return;

    const now = ctx.currentTime;
    const { freq, dur, vel = 1.0 } = note;

    // 1. Primary chime oscillator (pure sine fundamental)
    const osc = ctx.createOscillator();
    const tineGain = ctx.createGain();

    // 2. High-register harmonic overtone (subtle bell shimmer)
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();

    // 3. Warm lowpass filter to emulate antique wooden soundbox
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.Q.setValueAtTime(1.2, now);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2.756, now); // Metallic chime ratio

    const peakFund = 0.24 * vel;
    const peakOvertone = 0.038 * vel;

    // Envelope for fundamental: swift soft attack (12ms), long peaceful exponential decay
    tineGain.gain.setValueAtTime(0.0001, now);
    tineGain.gain.linearRampToValueAtTime(peakFund, now + 0.012);
    tineGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    // Envelope for overtone: very faint initial tap
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.linearRampToValueAtTime(peakOvertone, now + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.45);

    // Audio Graph Connections
    osc.connect(tineGain);
    overtone.connect(overtoneGain);
    tineGain.connect(filter);
    overtoneGain.connect(filter);
    filter.connect(gainNode);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + dur + 0.05);
    overtone.stop(now + dur * 0.5);

    const nodeRef = { osc, overtone, tineGain, overtoneGain, filter };
    activeNodes.push(nodeRef);

    setTimeout(() => {
      try {
        osc.disconnect();
        overtone.disconnect();
        tineGain.disconnect();
        overtoneGain.disconnect();
        filter.disconnect();
      } catch {
        // Ignored
      }
      activeNodes = activeNodes.filter((n) => n !== nodeRef);
    }, (dur + 0.1) * 1000);
  } catch {
    // Audio synthesis error catch
  }
}

function scheduleNext() {
  if (!isPlaying || !audioCtx) return;

  const note = LULLABY_SCORE[currentNoteIndex];
  playMusicBoxTine(note, audioCtx, masterGain);

  currentNoteIndex = (currentNoteIndex + 1) % LULLABY_SCORE.length;
  timerId = setTimeout(scheduleNext, NOTE_INTERVAL_MS);
}

/**
 * Start or resume the background lullaby
 * @param {Object} options
 * @param {boolean} options.isExplicitUserAction - Whether triggered by direct user gesture
 */
export async function startLullaby({ isExplicitUserAction = false } = {}) {
  if (isExplicitUserAction) {
    userHasExplicitlyPaused = false;
    wakePrompt = false;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_USER_PAUSED_KEY, 'false');
      } catch {
        // Storage access blocked or quota exceeded
      }
    }
  }

  const ctx = ensureAudioGraph();
  if (!ctx) {
    isPlaying = false;
    notifyListeners();
    return false;
  }

  if (suspendTimer) {
    clearTimeout(suspendTimer);
    suspendTimer = null;
  }

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (ctx.state !== 'running') {
      isPlaying = false;
      // Autoplay or background restriction prevented running state
      if (!userHasExplicitlyPaused) {
        wakePrompt = true;
      }
      notifyListeners();
      return false;
    }

    if (isPlaying) {
      cleanupInteractionWake();
      wakePrompt = false;
      notifyListeners();
      return true;
    }

    isPlaying = true;
    cleanupInteractionWake();
    wakePrompt = false;
    notifyListeners();

    // Ramp volume smoothly up to target level
    if (masterGain) {
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value > 0.001 ? masterGain.gain.value : 0.0001, now);
      masterGain.gain.linearRampToValueAtTime(volume, now + 0.3);
    }

    scheduleNext();
    return true;
  } catch {
    isPlaying = false;
    if (!userHasExplicitlyPaused) {
      wakePrompt = true;
      setupOneTimeInteractionWake();
    }
    notifyListeners();
    return false;
  }
}

/**
 * Pause the background lullaby gracefully
 * @param {Object} options
 * @param {boolean} options.isExplicitUserAction - If user deliberately clicked pause
 * @param {boolean} options.isBackgroundHide - If triggered by switching tabs
 */
export function pauseLullaby({ isExplicitUserAction = false, isBackgroundHide = false } = {}) {
  if (isExplicitUserAction) {
    cleanupInteractionWake();
    userHasExplicitlyPaused = true;
    wakePrompt = false;
    wasPlayingBeforeHide = false;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_USER_PAUSED_KEY, 'true');
      } catch {
        // Storage access blocked or quota exceeded
      }
    }
  } else if (isBackgroundHide) {
    wasPlayingBeforeHide = true;
  }

  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }

  if (masterGain && audioCtx && audioCtx.state === 'running') {
    // Fade out softly over 150ms to prevent any audible click
    try {
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);

      // Sleep audio context after fade-out to stop CPU processing completely
      if (suspendTimer) clearTimeout(suspendTimer);
      suspendTimer = setTimeout(() => {
        if (!isPlaying && audioCtx && audioCtx.state === 'running') {
          audioCtx.suspend().catch(() => {});
        }
      }, 180);
    } catch {
      // Ignored
    }
  }

  isPlaying = false;
  notifyListeners();
}

/**
 * Toggle play/pause (User-initiated)
 */
export async function toggleLullaby() {
  if (isPlaying) {
    pauseLullaby({ isExplicitUserAction: true });
    return false;
  } else {
    return await startLullaby({ isExplicitUserAction: true });
  }
}

/**
 * Handle document visibility change (tab switch / minimize)
 */
export function handleVisibilityChange() {
  if (typeof document === 'undefined') return;

  if (document.hidden) {
    if (isPlaying) {
      pauseLullaby({ isExplicitUserAction: false, isBackgroundHide: true });
    }
  } else {
    // Tab became visible again
    if (wasPlayingBeforeHide && !userHasExplicitlyPaused) {
      wasPlayingBeforeHide = false;
      startLullaby({ isExplicitUserAction: false }).then((ok) => {
        if (!ok) {
          wakePrompt = true;
          notifyListeners();
          setupOneTimeInteractionWake();
        }
      });
    }
  }
}

/**
 * Handle page lifecycle termination/freezing
 */
export function handlePageLifecycle() {
  if (isPlaying) {
    pauseLullaby({ isExplicitUserAction: false, isBackgroundHide: true });
  }
}

/**
 * Attempt smart autoplay on initial page mount:
 * - Only if tab is visible
 * - Only if user hasn't explicitly chosen to pause previously
 * - If browser blocks, gently sets wakePrompt = true and arms one-time interaction wake
 */
export async function attemptAutoplayOnMount() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Never override an explicit user pause!
  if (userHasExplicitlyPaused) {
    return;
  }

  if (document.visibilityState !== 'visible') {
    wasPlayingBeforeHide = true;
    return;
  }

  const ok = await startLullaby({ isExplicitUserAction: false });
  if (!ok) {
    wakePrompt = true;
    notifyListeners();
    // Arm one-time interaction wake: one click/touch anywhere starts playback reliably
    setupOneTimeInteractionWake();
  }
}

/**
 * Adjust volume (0.0 to 1.0)
 * Uses setValueAtTime anchoring to eliminate clicks
 */
export function setLullabyVolume(newVol) {
  const clamped = Math.max(0, Math.min(1, newVol));
  volume = clamped;

  if (masterGain && audioCtx && audioCtx.state === 'running') {
    try {
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(clamped, now + 0.05);
    } catch {
      masterGain.gain.value = clamped;
    }
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_VOL_KEY, clamped.toFixed(2));
    } catch {
      // Storage access blocked or quota exceeded
    }
  }

  notifyListeners();
}

export function getLullabyVolume() {
  return volume;
}

export function isLullabyPlaying() {
  return isPlaying;
}

export function isUserExplicitlyPaused() {
  return userHasExplicitlyPaused;
}

export function getWakePrompt() {
  return wakePrompt;
}

export function setWakePrompt(val) {
  wakePrompt = Boolean(val);
  notifyListeners();
}

/**
 * Subscribe to state updates (playing, volume, wakePrompt, userHasExplicitlyPaused)
 */
export function subscribeToLullaby(fn) {
  listeners.add(fn);
  fn({ isPlaying, volume, wakePrompt, userHasExplicitlyPaused });
  return () => {
    listeners.delete(fn);
  };
}
