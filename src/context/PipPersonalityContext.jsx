import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const PipPersonalityContext = createContext(null);

export const PIP_STATES = {
  DREAMING: 'dreaming',
  CURIOUS: 'curious',
  HAPPY: 'happy',
  PROUD: 'proud',
  WATCHFUL: 'watchful',
};

export function PipPersonalityProvider({ children }) {
  const [personalityState, setPersonalityState] = useState(PIP_STATES.WATCHFUL);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [messageVisible, setMessageVisible] = useState(false);

  const messageTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Clear pending message timer
  const clearMessageTimer = () => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
  };

  // Trigger a personality reaction with message
  const triggerReaction = useCallback((state, message, duration = 4500) => {
    if (!isMountedRef.current) return;

    clearMessageTimer();
    setPersonalityState(state);
    setCurrentMessage(message);
    setMessageVisible(true);

    messageTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setMessageVisible(false);
      }
    }, duration);

    resetIdleTimer();
  }, []);

  // Idle timer: 18 seconds of inactivity drifts Pip to dreaming
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      // Drift gently to dreaming
      triggerReaction(PIP_STATES.DREAMING, 'Shhh… Pip dozed off mid-calibration. A tiny wrench is still in one paw.', 5000);
    }, 18000);
  }, [triggerReaction]);

  useEffect(() => {
    isMountedRef.current = true;
    resetIdleTimer();

    const handleUserActivity = () => {
      setPersonalityState((prev) => {
        if (prev === PIP_STATES.DREAMING) {
          setMessageVisible(false);
          return PIP_STATES.WATCHFUL;
        }
        return prev;
      });
      resetIdleTimer();
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });

    return () => {
      isMountedRef.current = false;
      clearMessageTimer();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [resetIdleTimer]);

  const [hasUnlockedMoonSecret, setHasUnlockedMoonSecret] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('secret') === 'true') return true;
      return localStorage.getItem('pip_moon_secret_unlocked') === 'true';
    }
    return false;
  });

  const [hasCompletedGame, setHasCompletedGame] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedCompleted = localStorage.getItem('pip_game_completed') === 'true';
      const storedScore = parseInt(localStorage.getItem('pip_dream_catch_best') || '0', 10);
      return storedCompleted || storedScore > 0;
    }
    return false;
  });

  const [discoveredConstellations, setDiscoveredConstellations] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('pip_atlas_discovered');
        if (stored) return JSON.parse(stored);
      } catch {
        // Ignored
      }
    }
    return ['lyra']; // default start with Lyra Harmonica charted
  });

  const recordConstellationDiscovered = useCallback((id) => {
    setDiscoveredConstellations((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pip_atlas_discovered', JSON.stringify(next));
        } catch {
          // Ignored
        }
      }
      return next;
    });
  }, []);

  const triggerMusicalStarChime = useCallback((starName, noteName) => {
    triggerReaction(PIP_STATES.CURIOUS, `Harmonic reading confirmed: ${starName} resonating at ${noteName}. Tine calibration holding steady. ✦`);
  }, [triggerReaction]);

  const triggerMoonEasterEgg = useCallback(() => {
    setHasUnlockedMoonSecret(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pip_moon_secret_unlocked', 'true');
    }
    triggerReaction(PIP_STATES.CURIOUS, 'Observatory access granted. Log #777 unsealed — please handle with clean starlight gloves. ✦', 4500);
  }, [triggerReaction]);

  const triggerProjectExplored = useCallback((actionNote) => {
    triggerReaction(PIP_STATES.CURIOUS, actionNote, 4000);
  }, [triggerReaction]);

  const triggerGuestbookWish = useCallback((author) => {
    const from = author ? `from ${author}` : '';
    triggerReaction(PIP_STATES.PROUD, `Dream parcel received and logged. Pip has stamped it for the 04:30 dawn glider ${from}. Safe skies tonight. ✦`, 4500);
  }, [triggerReaction]);

  const triggerGameCompletion = useCallback((score, isCelebration = false, isNewBest = false) => {
    setHasCompletedGame(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pip_game_completed', 'true');
    }
    let msg;
    if (isNewBest) {
      msg = `New station record! ${score} starlight packets gathered. Pip is updating the logboard and doing a small, quiet dance. ✦`;
    } else if (isCelebration) {
      msg = `Midnight Starlight Ribbon awarded. ${score} points logged. The nursery rafters are glowing tonight. ✦`;
    } else {
      msg = `Shift complete. ${score} falling dreams boxed and labeled. Pip is brewing a tiny cup of chamomile before the next round. ✦`;
    }
    triggerReaction(PIP_STATES.HAPPY, msg, 5000);
  }, [triggerReaction]);

  const triggerConstellationExplored = useCallback((name, isSpecial = false, constellationId = '') => {
    const specificNotes = {
      lyra: 'Lyra Harmonica inked. Pip filed the 12 bronze tines to match these five stars. ✦',
      lucis: 'Lucis Lantern charted. 2200K amber glow mapped across nursery flight paths. ✦',
      via_somnia: 'Via Somnia mapped. The stardust highway between Cloud #09 and Pillow Haven is clear. ✦',
      stella_cadens: 'Stella Cadens coordinates logged. The falling dream net is strung across Sector 04. ✦',
      crescentia: 'Crescentia unlocked! Pip’s private observatory sanctuary is revealed in the canon. ✦',
      corona_somniorum: 'Corona Somniorum crowned! The Master Starlight Ribbon shines in the zenith. ✦',
    };
    if (constellationId && specificNotes[constellationId]) {
      triggerReaction(isSpecial ? PIP_STATES.HAPPY : PIP_STATES.CURIOUS, specificNotes[constellationId], 4500);
    } else if (isSpecial) {
      triggerReaction(PIP_STATES.HAPPY, `${name} coordinates verified and inked. Pip’s cartography pen is still warm. A golden pin marks the chart. ✦`, 4500);
    } else {
      triggerReaction(PIP_STATES.CURIOUS, `Tracing ${name}… steady hand, steady breath. The starlines are connecting. ✦`, 3500);
    }
  }, [triggerReaction]);

  const wakePip = useCallback(() => {
    triggerReaction(PIP_STATES.WATCHFUL, 'Oh! Hello, dreamer. Station 07 is quiet tonight. Pip just finished polishing a crescent lens. ✦', 4000);
  }, [triggerReaction]);

  return (
    <PipPersonalityContext.Provider
      value={{
        personalityState,
        currentMessage,
        messageVisible,
        hasUnlockedMoonSecret,
        setHasUnlockedMoonSecret,
        hasCompletedGame,
        setHasCompletedGame,
        discoveredConstellations,
        recordConstellationDiscovered,
        triggerReaction,
        triggerMusicalStarChime,
        triggerMoonEasterEgg,
        triggerProjectExplored,
        triggerGuestbookWish,
        triggerGameCompletion,
        triggerConstellationExplored,
        wakePip,
      }}
    >
      {children}
    </PipPersonalityContext.Provider>
  );
}

export function usePipPersonality() {
  const context = useContext(PipPersonalityContext);
  if (!context) {
    return {
      personalityState: PIP_STATES.WATCHFUL,
      currentMessage: null,
      messageVisible: false,
      hasUnlockedMoonSecret: false,
      setHasUnlockedMoonSecret: () => {},
      hasCompletedGame: false,
      setHasCompletedGame: () => {},
      discoveredConstellations: ['lyra'],
      recordConstellationDiscovered: () => {},
      triggerReaction: () => {},
      triggerMusicalStarChime: () => {},
      triggerMoonEasterEgg: () => {},
      triggerProjectExplored: () => {},
      triggerGuestbookWish: () => {},
      triggerGameCompletion: () => {},
      triggerConstellationExplored: () => {},
      wakePip: () => {},
    };
  }
  return context;
}
