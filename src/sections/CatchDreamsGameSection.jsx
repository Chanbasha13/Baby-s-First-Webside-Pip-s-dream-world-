import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playStarCatchSound, playGameVictorySound, isSoundEnabled } from '../utils/chimes';
import { usePipPersonality } from '../context/PipPersonalityContext';
import { SecretClueButton } from '../components/SecretDreamQuest';

// Game constants
const ROUND_DURATION = 30; // 30 seconds round
const TARGET_CELEBRATION_SCORE = 800; // Points needed for Starlight Ribbon
const STORAGE_KEY_BEST = 'pip_dream_catch_best';

// Bespoke Vector Star Tokens representing Pip's Midnight Nursery dreams
function DreamStarToken({ type, size = 44 }) {
  if (type === 'gold') {
    // 4-point faceted diamond celestial star with luminous core
    return (
      <svg
        viewBox="0 0 48 48"
        className="dream-star-vector star-vector-gold"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="gold-core-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fff2c2" />
            <stop offset="70%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#f4b248" />
          </radialGradient>
          <filter id="gold-glow-filter" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Whimsical silk parachute string */}
        <line x1="24" y1="1" x2="24" y2="8" stroke="rgba(255, 209, 102, 0.45)" strokeWidth="1.5" strokeDasharray="2 2" />
        {/* Diamond starlight body */}
        <path
          d="M 24 7 Q 24 24 7 24 Q 24 24 24 41 Q 24 24 41 24 Q 24 24 24 7 Z"
          fill="url(#gold-core-grad)"
          filter="url(#gold-glow-filter)"
          stroke="#ffe899"
          strokeWidth="0.8"
        />
        {/* Inner brilliant sparkle */}
        <circle cx="24" cy="24" r="3.2" fill="#ffffff" />
      </svg>
    );
  }

  if (type === 'silver') {
    // Silver / Sky Blue Moonbeam Spark with starlight pearl
    return (
      <svg
        viewBox="0 0 48 48"
        className="dream-star-vector star-vector-silver"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="silver-moon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#d4ecfc" />
            <stop offset="100%" stopColor="#8ec4eb" />
          </linearGradient>
        </defs>
        <line x1="24" y1="1" x2="24" y2="8" stroke="rgba(142, 196, 235, 0.5)" strokeWidth="1.5" strokeDasharray="2 2" />
        {/* Crescent moon cradle */}
        <path
          d="M 29 9 A 14.5 14.5 0 1 0 35 34 A 11 11 0 1 1 29 9 Z"
          fill="url(#silver-moon-grad)"
          stroke="#e2f3ff"
          strokeWidth="0.8"
        />
        {/* Starlight pearl inside crescent */}
        <polygon
          points="25,18 26.8,22.5 31.5,24 26.8,25.5 25,30 23.2,25.5 18.5,24 23.2,22.5"
          fill="#ffffff"
        />
      </svg>
    );
  }

  if (type === 'lavender') {
    // Fluffy cloud cotton fleece holding a bedtime dream spark
    return (
      <svg
        viewBox="0 0 48 48"
        className="dream-star-vector star-vector-lavender"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cloud-fleece-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#eedafc" />
            <stop offset="100%" stopColor="#cca1e8" />
          </linearGradient>
        </defs>
        <line x1="24" y1="1" x2="24" y2="10" stroke="rgba(204, 161, 232, 0.5)" strokeWidth="1.5" strokeDasharray="2 2" />
        {/* Soft dream cloud */}
        <path
          d="M 16 33 C 11.5 33 8 29.5 8 25 C 8 21.2 10.8 18.2 14.5 17.6 C 16 12.8 20.2 10 25 10.8 C 29.2 11.5 32.5 15 32.8 19.2 C 36.8 19.8 40 23.2 40 27.5 C 40 31.8 36.5 33 32 33 Z"
          fill="url(#cloud-fleece-grad)"
          stroke="#f6e8ff"
          strokeWidth="0.8"
        />
        {/* Embedded sleepy star sparkle */}
        <polygon
          points="24,19 25.2,22 28.5,23 25.2,24 24,27 22.8,24 19.5,23 22.8,22"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // type === 'berry': Pip's 5-point radiant Wishing Star
  return (
    <svg
      viewBox="0 0 48 48"
      className="dream-star-vector star-vector-berry"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="berry-star-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#ffa0c5" />
          <stop offset="75%" stopColor="#eb5f91" />
          <stop offset="100%" stopColor="#b63363" />
        </radialGradient>
      </defs>
      <line x1="24" y1="1" x2="24" y2="8" stroke="rgba(235, 95, 145, 0.6)" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* 5-point storybook wishing star */}
      <polygon
        points="24,9 28.3,19.8 40,20.5 30.8,27.5 34.2,39 24,32.5 13.8,39 17.2,27.5 8,20.5 19.7,19.8"
        fill="url(#berry-star-grad)"
        stroke="#ffd9e8"
        strokeWidth="0.8"
      />
      <circle cx="24" cy="24" r="3.2" fill="#ffffff" />
    </svg>
  );
}

// Star varieties inspired by Pip's Midnight Nursery
const STAR_TYPES = [
  {
    type: 'gold',
    name: 'Starlight Dream',
    symbol: '✦',
    basePoints: 50,
    speed: 3.8, // seconds to fall
    chance: 0.50,
    colorClass: 'star-type-gold',
    glow: 'rgba(244, 178, 72, 0.4)',
  },
  {
    type: 'silver',
    name: 'Moonbeam Spark',
    symbol: '☾',
    basePoints: 75,
    speed: 3.4,
    chance: 0.25,
    colorClass: 'star-type-silver',
    glow: 'rgba(156, 208, 240, 0.45)',
  },
  {
    type: 'lavender',
    name: 'Cloud Cotton',
    symbol: '☁',
    basePoints: 100,
    speed: 4.2,
    chance: 0.15,
    colorClass: 'star-type-lavender',
    glow: 'rgba(200, 170, 240, 0.45)',
  },
  {
    type: 'berry',
    name: 'Pip’s Wishing Star',
    symbol: '★',
    basePoints: 150,
    speed: 3.0,
    chance: 0.10,
    colorClass: 'star-type-berry',
    glow: 'rgba(235, 95, 145, 0.55)',
  },
];

function pickRandomStarType() {
  const rand = Math.random();
  let cumulative = 0;
  for (const starType of STAR_TYPES) {
    cumulative += starType.chance;
    if (rand <= cumulative) return starType;
  }
  return STAR_TYPES[0];
}

export default function CatchDreamsGameSection() {
  const { triggerGameCompletion } = usePipPersonality();

  // Game lifecycle: 'intro' | 'playing' | 'paused' | 'gameover'
  const [gameState, setGameState] = useState('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [caughtCount, setCaughtCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [stars, setStars] = useState([]);
  const [scoreFloats, setScoreFloats] = useState([]);
  const [comboResetAlert, setComboResetAlert] = useState(false);
  const [srAnnouncement, setSrAnnouncement] = useState('');

  // Personal Best from localStorage
  const [personalBest, setPersonalBest] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_BEST);
        return stored ? parseInt(stored, 10) || 0 : 0;
      } catch {
        // Storage access blocked
      }
    }
    return 0;
  });

  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);

  // Refs for timers and game loop
  const timerIntervalRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const isPlayingRef = useRef(false);
  const skyStageRef = useRef(null);
  const nextStarIdRef = useRef(1);
  const nextFloatIdRef = useRef(1);

  // Keep isPlayingRef in sync
  useEffect(() => {
    isPlayingRef.current = gameState === 'playing';
  }, [gameState]);

  // Clean up all timers on unmount
  useEffect(() => {
    window.__pip_test_end_game__ = (forcedScore) => {
      if (typeof forcedScore === 'number') {
        setScore(forcedScore);
      }
      setTimeLeft(0);
    };

    return () => {
      delete window.__pip_test_end_game__;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, []);

  // Compute combo multiplier: 1-2 => 1x, 3-5 => 2x, 6-9 => 3x, 10+ => 4x
  const getComboMultiplier = useCallback((currentCombo) => {
    if (currentCombo >= 10) return 4;
    if (currentCombo >= 6) return 3;
    if (currentCombo >= 3) return 2;
    return 1;
  }, []);

  // Reset combo on miss or click outside
  const handleComboReset = useCallback(() => {
    setCombo((prev) => {
      if (prev > 1) {
        setComboResetAlert(true);
        setTimeout(() => setComboResetAlert(false), 900);
      }
      return 1;
    });
  }, []);

  // Spawns a new falling star
  const spawnStar = useCallback(() => {
    if (!isPlayingRef.current) return;

    // Constrain X position between 8% and 86% of playfield width
    const leftPercent = 8 + Math.random() * 78;
    const starType = pickRandomStarType();
    const id = nextStarIdRef.current++;

    const newStar = {
      id,
      ...starType,
      left: leftPercent,
      spawnTime: Date.now(),
      caught: false,
    };

    setStars((prev) => [...prev.slice(-6), newStar]); // Keep at most 7 active stars

    // Schedule next spawn with dynamic pacing (650ms to 950ms)
    const nextSpawnDelay = 650 + Math.random() * 300;
    spawnTimerRef.current = setTimeout(spawnStar, nextSpawnDelay);
  }, []);

  // Start a new 30-second round
  const startGame = () => {
    // Clean old timers
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);

    setScore(0);
    setTimeLeft(ROUND_DURATION);
    setCombo(1);
    setMaxCombo(1);
    setCaughtCount(0);
    setMissedCount(0);
    setStars([]);
    setScoreFloats([]);
    setIsNewRecord(false);
    setIsCelebration(false);
    setComboResetAlert(false);

    isPlayingRef.current = true;
    setGameState('playing');
    setSrAnnouncement('Round started! 30 seconds on the clock. Catch the falling dream stars!');

    // Start 1-second countdown
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          return 0;
        }
        if (prev === 16) {
          setSrAnnouncement('15 seconds remaining!');
        } else if (prev === 6) {
          setSrAnnouncement('5 seconds left! Catch final stars!');
        }
        return prev - 1;
      });
    }, 1000);

    // Initial star spawn
    spawnStar();
  };

  // Pause / Resume toggle
  const togglePause = () => {
    if (gameState === 'playing') {
      isPlayingRef.current = false;
      setGameState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      setSrAnnouncement('Game paused.');
    } else if (gameState === 'paused') {
      isPlayingRef.current = true;
      setGameState('playing');
      setSrAnnouncement('Game resumed.');

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      spawnStar();
    }
  };

  // Round completion when time hits 0
  const endGame = useCallback((finalScore, finalCaught) => {
    isPlayingRef.current = false;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);

    setGameState('gameover');
    setStars([]);

    // Check personal best
    let previousBest = 0;
    try {
      previousBest = parseInt(localStorage.getItem(STORAGE_KEY_BEST) || '0', 10);
    } catch {
      // Storage access blocked
    }
    const newRecord = finalScore > previousBest;
    const reachedTarget = finalScore >= TARGET_CELEBRATION_SCORE;

    if (newRecord) {
      try {
        localStorage.setItem(STORAGE_KEY_BEST, String(finalScore));
      } catch {
        // Storage access blocked or quota exceeded
      }
      setPersonalBest(finalScore);
      setIsNewRecord(true);
    }
    setIsCelebration(reachedTarget);

    // Play victory sound if sound is on
    playGameVictorySound(reachedTarget);

    // Trigger Pip's living personality reaction in the hero section!
    triggerGameCompletion(finalScore, reachedTarget, newRecord);

    setSrAnnouncement(
      `Round finished! You scored ${finalScore} points and caught ${finalCaught} dream stars. ${
        newRecord ? 'New Personal Best!' : ''
      }`
    );
  }, [triggerGameCompletion]);

  // Monitor timer reaching 0
  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      endGame(score, caughtCount);
    }
  }, [timeLeft, gameState, score, caughtCount, endGame]);

  // Catch a star handler (mouse, touch, or keyboard)
  const catchStar = (starId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (gameState !== 'playing') return;

    setStars((prev) => {
      const target = prev.find((s) => s.id === starId && !s.caught);
      if (!target) return prev;

      // Award points with combo multiplier
      const multiplier = getComboMultiplier(combo);
      const pointsEarned = target.basePoints * multiplier;

      setScore((s) => s + pointsEarned);
      setCaughtCount((c) => c + 1);

      // Increment combo
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));

      // Play soft chime note scaling with combo level
      playStarCatchSound(newCombo);

      // Spawn floating score badge
      const floatId = nextFloatIdRef.current++;
      setScoreFloats((floats) => [
        ...floats.slice(-4),
        {
          id: floatId,
          points: pointsEarned,
          multiplier,
          left: target.left,
        },
      ]);

      // Remove float after animation
      setTimeout(() => {
        setScoreFloats((floats) => floats.filter((f) => f.id !== floatId));
      }, 700);

      // Mark star as caught (triggers burst animation, then removes)
      return prev.map((s) => (s.id === starId ? { ...s, caught: true } : s));
    });

    // Remove caught star from state after quick burst
    setTimeout(() => {
      setStars((prev) => prev.filter((s) => s.id !== starId));
    }, 280);
  };

  // Handle star reaching the bottom without being caught (Fair miss)
  const handleStarEscaped = (starId) => {
    setStars((prev) => {
      const star = prev.find((s) => s.id === starId);
      if (star && !star.caught) {
        setMissedCount((m) => m + 1);
        handleComboReset();
      }
      return prev.filter((s) => s.id !== starId);
    });
  };

  // Keyboard shortcut: Press Space to catch the lowest star on screen!
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      // Spacebar catches lowest active star
      if (e.code === 'Space' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        setStars((currentStars) => {
          const uncaught = currentStars.filter((s) => !s.caught);
          if (uncaught.length > 0) {
            // Star with lowest remaining time (oldest spawn) is lowest on screen
            const lowest = uncaught[0];
            catchStar(lowest.id);
          }
          return currentStars;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, combo, getComboMultiplier]);

  const currentMultiplier = getComboMultiplier(combo);

  return (
    <section id="catch-dreams" className="catch-dreams-section">
      <span id="game" aria-hidden="true" style={{ position: 'relative', top: '-80px', display: 'block' }} />
      <div className="container">
        {/* Section Header */}
        <div className="section-header-block">
          <div className="storybook-chapter-folio">
            <span className="chapter-roman-numeral">CHAPTER IV</span>
            <span className="chapter-folio-divider" aria-hidden="true">❖</span>
            <span className="chapter-folio-tag">The Starlight Gathering Shift</span>
          </div>
          <h2 className="section-title">Catch the Falling Dreams</h2>
          <p className="section-description">
            Before morning light, stray starlight and bedtime wishes drift from the nursery clouds.
            Put on your soft starlight gloves and help Pip gather them safely before dawn!
          </p>

          <div className="storybook-floret-divider" aria-hidden="true">
            <span className="floret-line" />
            <span className="floret-glyph">✦ ❖ ✦</span>
            <span className="floret-line" />
          </div>
        </div>

        {/* Screen Reader Announcements */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {srAnnouncement}
        </div>

        {/* Main Game Card Container */}
        <div className="game-card-wrapper">
          {/* ================================================================= */}
          {/* SCREEN 1: INTRODUCTION & RULES */}
          {/* ================================================================= */}
          {gameState === 'intro' && (
            <div className="game-intro-card" data-tilt="primary">
              <div className="game-intro-grid">
                {/* Storybook Pip Character Frame */}
                <div className="game-intro-media">
                  <SecretClueButton clueId="moon" className="secret-clue-moon" />
                  <div className="game-pip-portal">
                    <img
                      src="/assets/pip_portrait.png"
                      alt="Pip the Skull Baby wearing cozy pajamas and smiling warmly"
                      className="game-pip-img"
                      width="512"
                      height="640"
                    />
                  </div>
                  <div className="game-nursery-badge">
                    <span aria-hidden="true">★</span>
                    <span>Midnight Shift Ready</span>
                  </div>
                </div>

                {/* Rules & Game Instructions */}
                <div className="game-intro-content">
                  <span className="game-kicker-tag">Midnight Shift Briefing</span>
                  <h3 className="game-intro-title">Your Shift Begins at Sundown</h3>
                  <p className="game-intro-desc">
                    Stray dreams are drifting loose between the cloud banks tonight. Pip needs a second pair of hands.
                    You have 30 seconds before the dawn gliders depart — every dream you catch gets boxed and loaded for delivery.
                  </p>

                  <ul className="game-rules-list">
                    <li>
                      <span className="rule-bullet" aria-hidden="true">✦</span>
                      <div>
                        <strong>Tap or Click:</strong> Catch falling stars with mouse, touch, or the <kbd>Spacebar</kbd>.
                      </div>
                    </li>
                    <li>
                      <span className="rule-bullet" aria-hidden="true">⚡</span>
                      <div>
                        <strong>Chain Combos:</strong> Catch stars consecutively to build up to a <strong>4x multiplier</strong>!
                      </div>
                    </li>
                    <li>
                      <span className="rule-bullet" aria-hidden="true">🏆</span>
                      <div>
                        <strong>Earn Pip’s Ribbon:</strong> Reach <strong>{TARGET_CELEBRATION_SCORE}+ points</strong> to receive Pip’s Midnight Starlight Ribbon.
                      </div>
                    </li>
                  </ul>

                  {/* Personal Best Display */}
                  <div className="game-best-record-banner" data-tilt="secondary">
                    <div className="record-icon" aria-hidden="true">🌟</div>
                    <div className="record-details">
                      <span className="record-label">Your Personal Best</span>
                      <span className="record-score">
                        {personalBest > 0 ? `${personalBest} pts` : 'No record yet — be the first!'}
                      </span>
                      <span className="record-privacy-note">
                        ✦ Saved locally on this device. Never sent to any external server.
                      </span>
                    </div>
                  </div>

                  {/* Start Action */}
                  <div className="game-intro-cta-row">
                    <button
                      type="button"
                      className="btn btn-primary game-start-btn"
                      onClick={startGame}
                    >
                      <span>Clock In — 30 Second Shift</span>
                      <span aria-hidden="true">✦</span>
                    </button>
                    <span className="game-audio-hint">
                      {isSoundEnabled() ? '🔔 Sound chimes enabled' : '🔕 Chimes muted (toggle in navbar)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SCREEN 2: ACTIVE PLAYFIELD */}
          {/* ================================================================= */}
          {(gameState === 'playing' || gameState === 'paused') && (
            <div className="game-stage-wrapper">
              {/* Top HUD Dashboard (Never overlapping falling stars) */}
              <div className="game-hud-bar" role="region" aria-label="Game Status Bar">
                {/* Score */}
                <div className="hud-metric hud-metric-score">
                  <span className="hud-label">Score</span>
                  <span className="hud-value hud-score-val">{score}</span>
                </div>

                {/* Countdown Timer with Visual Meter */}
                <div className="hud-metric hud-metric-timer">
                  <div className="hud-timer-header">
                    <span className="hud-label">Time Remaining</span>
                    <span className={`hud-timer-digits ${timeLeft <= 5 ? 'is-urgent' : ''}`}>
                      {timeLeft}s
                    </span>
                  </div>
                  <div className="hud-timer-track" aria-hidden="true">
                    <div
                      className={`hud-timer-fill ${timeLeft <= 5 ? 'fill-urgent' : ''}`}
                      style={{ width: `${(timeLeft / ROUND_DURATION) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Combo Multiplier */}
                <div className="hud-metric hud-metric-combo">
                  <span className="hud-label">Streak Multiplier</span>
                  <div className={`combo-multiplier-pill combo-tier-${currentMultiplier}`}>
                    <span className="combo-sparkle" aria-hidden="true">⚡</span>
                    <span className="combo-multiplier-text">{currentMultiplier}x</span>
                    <span className="combo-streak-count">({combo} in a row)</span>
                  </div>
                </div>

                {/* Controls (Pause/Resume) */}
                <div className="hud-controls">
                  <button
                    type="button"
                    className="hud-pause-btn"
                    onClick={togglePause}
                    aria-label={gameState === 'paused' ? 'Resume game' : 'Pause game'}
                  >
                    {gameState === 'paused' ? '▶ Resume' : '❚❚ Pause'}
                  </button>
                </div>
              </div>

              {/* Combo Reset Notification Banner */}
              {comboResetAlert && (
                <div className="combo-reset-toast" aria-hidden="true">
                  Combo Reset · Keep watching! ✦
                </div>
              )}

              {/* Sky Falling Playfield */}
              <div
                ref={skyStageRef}
                className="game-sky-stage"
                onClick={handleComboReset}
                role="presentation"
                tabIndex={-1}
              >
                {/* Ambient Decorative Sky Backdrop */}
                <div className="sky-cloud-silhouette sky-cloud-bottom" aria-hidden="true" />
                <div className="sky-moon-silhouette" aria-hidden="true">☾</div>
                <div className="sky-twinkle-layer" aria-hidden="true">
                  <span className="ambient-sky-star s-1">⋆</span>
                  <span className="ambient-sky-star s-2">✦</span>
                  <span className="ambient-sky-star s-3">⋆</span>
                  <span className="ambient-sky-star s-4">✧</span>
                </div>

                {/* Keyboard Shortcut Hint for Desktop */}
                <div className="sky-shortcut-hint" aria-hidden="true">
                  <span>Press <kbd>Space</kbd> or tap stars to catch!</span>
                </div>

                {/* Falling Dream Stars */}
                {stars.map((star) => (
                  <button
                    key={star.id}
                    type="button"
                    className={`falling-star-btn ${star.colorClass} ${
                      star.caught ? 'is-caught' : ''
                    }`}
                    style={{
                      left: `${star.left}%`,
                      animationDuration: `${star.speed}s`,
                      animationPlayState: gameState === 'paused' ? 'paused' : 'running',
                    }}
                    onClick={(e) => catchStar(star.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        catchStar(star.id, e);
                      }
                    }}
                    onAnimationEnd={() => handleStarEscaped(star.id)}
                    aria-label={`Catch ${star.name} worth ${star.basePoints * currentMultiplier} points`}
                  >
                    <span className="star-aura" aria-hidden="true" style={{ boxShadow: `0 0 16px ${star.glow}` }} />
                    <DreamStarToken type={star.type} size={44} />
                    <span className="star-points-tag" aria-hidden="true">+{star.basePoints}</span>
                  </button>
                ))}

                {/* Floating Score Popups */}
                {scoreFloats.map((float) => (
                  <div
                    key={float.id}
                    className="score-float-item"
                    style={{ left: `${float.left}%` }}
                    aria-hidden="true"
                  >
                    <span>+{float.points}</span>
                    {float.multiplier > 1 && (
                      <span className="float-combo-tag">({float.multiplier}x)</span>
                    )}
                  </div>
                ))}

                {/* Paused Overlay */}
                {gameState === 'paused' && (
                  <div className="game-paused-overlay">
                    <div className="paused-card">
                      <span className="paused-icon" aria-hidden="true">💤</span>
                      <h4>Shift Paused</h4>
                      <p>Pip steadied the wind gauge and pulled the brake lever. The clouds are waiting.</p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={togglePause}
                      >
                        Resume Shift ▶
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SCREEN 3: RESULTS & CELEBRATION */}
          {/* ================================================================= */}
          {gameState === 'gameover' && (
            <div className="game-result-card" data-tilt="primary">
              <div className="game-result-header">
                <div className="result-avatar-halo">
                  <img
                    src="/assets/pip_avatar_cloud.png"
                    alt="Pip the Skull Baby on a cloud"
                    className="result-avatar-img"
                    width="64"
                    height="64"
                  />
                </div>
                <div className="result-kicker">
                  <span className="badge badge-gold">Shift Complete · Dawn Approaching</span>
                </div>
                <h3 className="result-title">Midnight Shift Summary</h3>
                <p className="result-subtitle">
                  Dawn approaching. The glider crews are loading your dream crates. Here is tonight’s shift report:
                </p>
              </div>

              {/* Special Target Score Celebration: Starlight Ribbon (800+ pts) */}
              {isCelebration && (
                <div className="celebration-ribbon-card">
                  <div className="ribbon-sparkle-layer" aria-hidden="true">
                    <span>✧</span>
                    <span>★</span>
                    <span>✦</span>
                  </div>
                  <div className="ribbon-badge">
                    <span className="ribbon-star" aria-hidden="true">🌟</span>
                    <div>
                      <h4 className="ribbon-title">Master Dream Catcher Ribbon</h4>
                      <p className="ribbon-desc">
                        “Station 07 shift record. Pip has filed the paperwork and pinned the Midnight Starlight Ribbon above the workbench. Every crate reached its pillow on time tonight.”
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Journeyman Tier (500 to 799 points) */}
              {!isCelebration && score >= 500 && (
                <div className="celebration-ribbon-card card-tier-journeyman">
                  <div className="ribbon-badge">
                    <span className="ribbon-star" aria-hidden="true">☾</span>
                    <div>
                      <h4 className="ribbon-title">Journeyman Starlight Gatherer</h4>
                      <p className="ribbon-desc">
                        “Solid shift. The outbound gliders departed full, and Pip counted every crate twice — all accounted for. The nursery is warm tonight.”
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cozy Slumber Cadet Tier (< 500 points) */}
              {!isCelebration && score < 500 && (
                <div className="celebration-ribbon-card card-tier-cadet">
                  <div className="ribbon-badge">
                    <span className="ribbon-star" aria-hidden="true">☁</span>
                    <div>
                      <h4 className="ribbon-title">Cozy Slumber Cadet</h4>
                      <p className="ribbon-desc">
                        “First shift in the books. Even one dream safely caught means one more child sleeps soundly. Pip saved you a spot on the roster for next time.”
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* New Personal Best Banner */}
              {isNewRecord && (
                <div className="new-record-banner">
                  <span aria-hidden="true">🎉</span>
                  <span>NEW PERSONAL BEST! All-time nursery record!</span>
                  <span aria-hidden="true">🎉</span>
                </div>
              )}

              {/* Score Breakdown Grid */}
              <div className="result-stats-grid">
                <div className="stat-box stat-score-box">
                  <span className="stat-label">Final Score</span>
                  <span className="stat-number stat-highlight">{score}</span>
                  <span className="stat-sub">points gathered</span>
                </div>

                <div className="stat-box">
                  <span className="stat-label">Dreams Caught</span>
                  <span className="stat-number">{caughtCount}</span>
                  <span className="stat-sub">starlight packets</span>
                </div>

                <div className="stat-box">
                  <span className="stat-label">Max Combo Streak</span>
                  <span className="stat-number">{maxCombo}x</span>
                  <span className="stat-sub">consecutive catches</span>
                </div>

                <div className="stat-box">
                  <span className="stat-label">Personal Best</span>
                  <span className="stat-number">{personalBest}</span>
                  <span className="stat-sub">in this browser</span>
                </div>
              </div>

              {/* Privacy Confirmation Note */}
              <p className="result-privacy-reassurance">
                ✦ Your personal best score is saved locally on your device only.
              </p>

              {/* Actions */}
              <div className="result-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={startGame}
                >
                  <span>Clock In Again ↺</span>
                  <span aria-hidden="true">✦</span>
                </button>
                <a href="#guestbook" className="btn btn-secondary">
                  <span>Sign the Bedtime Guestbook →</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Storybook Connector to Chapter V */}
        <div className="storybook-chapter-transition" aria-hidden="true">
          <span className="transition-ornament">✦ · · · · · · ❖ · · · · · · ✦</span>
        </div>
      </div>
    </section>
  );
}
