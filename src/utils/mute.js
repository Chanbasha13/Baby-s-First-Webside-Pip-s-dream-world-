// mute.js – Global mute utility for Pip's Dream World
// Provides a simple get/set API persisted in localStorage.
// Used to synchronize mute state across chime sounds and background lullaby.

const STORAGE_KEY = 'pip_global_mute';
let cached = null;

/**
 * Retrieve the current mute flag.
 * Returns true if audio is muted, false otherwise.
 */
export function isMuted() {
  if (cached !== null) return cached;
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    cached = stored === 'true';
  } catch {
    cached = false;
  }
  return cached;
}

/**
 * Internal helper to persist the mute flag.
 */
function persist(value) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore storage errors
    }
  }
}

/**
 * Set the global mute flag.
 * Persists the value to localStorage and updates the cached copy.
 * Also pauses the background lullaby when muting.
 * @param {boolean} flag – true to mute, false to unmute.
 */
export async function setMuted(flag) {
  const val = Boolean(flag);
  cached = val;
  persist(val);
  // Adjust background music based on mute state
  const { pauseLullaby } = await import('./backgroundLullaby');
  if (val) {
    // Mute: pause any playing lullaby (do not treat as explicit user pause)
    pauseLullaby({ isExplicitUserAction: false });
  }
}

/**
 * Toggle the mute flag and return the new state.
 */
export async function toggleMute() {
  const newState = !isMuted();
  await setMuted(newState);
  return newState;
}

/**
 * Optional helper to clear stored mute (e.g., during testing).
 */
export function clearMute() {
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
  cached = null;
}
let listeners = new Set();

export function subscribeToMute(callback) {
  listeners.add(callback);
  // Call immediately with current state
  callback(isMuted());
  return () => listeners.delete(callback);
}

function notifyListeners() {
  listeners.forEach((cb) => cb(isMuted()));
}
