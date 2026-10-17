import React, { useEffect, useRef, useState } from 'react';
import { playGentleChime, playEasterEggFanfare, playStarChime } from '../utils/chimes';
import { usePipPersonality } from '../context/PipPersonalityContext';

const STAR_CHIMES = [
  { id: 'lyra', name: 'Lyra', noteName: 'E5', freq: 659.25, style: { top: '12%', left: '14%' }, symbol: '✦' },
  { id: 'vega', name: 'Vega', noteName: 'G5', freq: 783.99, style: { top: '8%', left: '62%' }, symbol: '✦' },
  { id: 'altair', name: 'Altair', noteName: 'A5', freq: 880.00, style: { top: '28%', right: '18%' }, symbol: '★' },
  { id: 'polaris', name: 'Polaris', noteName: 'C6', freq: 1046.50, style: { top: '72%', left: '24%' }, symbol: '✧' },
];

/**
 * CelestialDreamEnvironment
 * Layered CSS 3D Depth, Crescent Moon with Secret Easter Egg Trigger,
 * Drifting Clouds, Musical Star Chimes, and Zero-Rerender Pointer Parallax
 */
export default function CelestialDreamEnvironment() {
  const { triggerMusicalStarChime, triggerMoonEasterEgg } = usePipPersonality();
  const containerRef = useRef(null);
  const moonBtnRef = useRef(null);
  const closeBtnRef = useRef(null);
  const rafIdRef = useRef(null);
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);

  // Hidden Easter Egg State (Click the moon 3 times or ?secret=true)
  const [moonClicks, setMoonClicks] = useState(0);
  const [pulseClick, setPulseClick] = useState(false);
  const [activeStarId, setActiveStarId] = useState(null);
  const [easterEggOpen, setEasterEggOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('secret') === 'true';
    }
    return false;
  });

  const closeEasterEgg = () => {
    setEasterEggOpen(false);
    setTimeout(() => {
      moonBtnRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    const handlePointerMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;

      targetXRef.current = Math.max(-1, Math.min(1, nx));
      targetYRef.current = Math.max(-1, Math.min(1, ny));

      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(updateParallax);
      }
    };

    const handlePointerLeave = () => {
      targetXRef.current = 0;
      targetYRef.current = 0;
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(updateParallax);
      }
    };

    const updateParallax = () => {
      const ease = 0.08;
      currentXRef.current += (targetXRef.current - currentXRef.current) * ease;
      currentYRef.current += (targetYRef.current - currentYRef.current) * ease;

      if (containerRef.current) {
        containerRef.current.style.setProperty(
          '--parallax-x',
          currentXRef.current.toFixed(4)
        );
        containerRef.current.style.setProperty(
          '--parallax-y',
          currentYRef.current.toFixed(4)
        );
      }

      const delta =
        Math.abs(targetXRef.current - currentXRef.current) +
        Math.abs(targetYRef.current - currentYRef.current);

      if (delta > 0.001) {
        rafIdRef.current = requestAnimationFrame(updateParallax);
      } else {
        rafIdRef.current = null;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Keyboard shortcut (Escape) to close Easter egg
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && easterEggOpen) {
        closeEasterEgg();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [easterEggOpen]);

  const handleMoonTap = () => {
    setPulseClick(true);
    setTimeout(() => setPulseClick(false), 300);

    setMoonClicks((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setEasterEggOpen(true);
        playEasterEggFanfare();
        triggerMoonEasterEgg();
        return 0;
      } else {
        playGentleChime(650 + next * 140, 0.18);
        return next;
      }
    });
  };

  const handleStarChime = (star) => {
    setActiveStarId(star.id);
    setTimeout(() => {
      setActiveStarId((curr) => (curr === star.id ? null : curr));
    }, 600);
    playStarChime(star.freq, 0.48);
    triggerMusicalStarChime(star.name, star.noteName);
  };

  return (
    <>
      <div className="dream-env-root" ref={containerRef}>
        <div className="dream-env-stage">
          {/* Layer 1: Far Deep Sky (Moon, Constellations, Twinkling Stars) */}
          <div className="env-layer-deep">
            {/* Interactive Crescent Moon (Clickable Easter Egg) */}
            <div className="crescent-moon-wrap">
              <button
                ref={moonBtnRef}
                type="button"
                className={`crescent-moon-btn ${pulseClick ? 'pulse-click' : ''}`}
                onClick={handleMoonTap}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMoonTap()}
                aria-label="Crescent Moon Nightlight · Tap to discover secret nursery log"
                aria-haspopup="dialog"
                aria-expanded={easterEggOpen}
                title="Tap the crescent moon..."
              >
                <svg
                  className="crescent-moon-svg"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="50" cy="50" r="44" className="moon-halo" />
                  <path
                    className="moon-body"
                    d="M 62 16 A 36 36 0 1 0 78 76 A 31 31 0 0 1 62 16 Z"
                  />
                  <circle cx="64" cy="18" r="2.5" fill="var(--color-surface)" />
                  <circle cx="76" cy="74" r="1.8" fill="var(--color-surface)" />
                </svg>
              </button>
            </div>

            {/* Starlight Constellation Lines (Purely Decorative) */}
            <svg className="constellation-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 140 70 L 320 130 L 450 60 L 620 150" fill="none" />
              <path d="M 700 240 L 820 170 L 920 280" fill="none" />
              <path d="M 80 290 L 240 430 L 380 370" fill="none" />
            </svg>

            {/* Designated Musical Star Chimes (Interactive on Hover, Tap & Keyboard) */}
            <div className="star-chimes-group">
              {STAR_CHIMES.map((star) => (
                <button
                  key={star.id}
                  type="button"
                  className={`star-chime-btn star-chime-${star.id} ${activeStarId === star.id ? 'is-chiming' : ''}`}
                  style={star.style}
                  onClick={() => handleStarChime(star)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleStarChime(star)}
                  aria-label={`Play Star Chime: ${star.name} (Note ${star.noteName})`}
                  title={`Starlight Chime · ${star.name} (${star.noteName}) · Tap to chime`}
                >
                  <span className="star-chime-aura" aria-hidden="true" />
                  <span className="star-chime-glyph" aria-hidden="true">{star.symbol}</span>
                  <span className="star-chime-tag" aria-hidden="true">{star.noteName}</span>
                </button>
              ))}
            </div>

            {/* Ambient Decorative Stars (Gentle soft twinkle) */}
            <div className="ambient-decorative-stars" aria-hidden="true">
              <span className="twinkle-star star-p2">★</span>
              <span className="twinkle-star star-p5">✧</span>
              <span className="twinkle-star star-p6">★</span>
              <span className="twinkle-star star-p8">⋆</span>
            </div>
          </div>

          {/* Layer 2: Distant Floating Cloud Banks (Purely Decorative) */}
          <div className="env-layer-mid" aria-hidden="true">
            <svg
              className="dream-cloud-bank cloud-bank-top"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                className="cloud-shape-path"
                d="M 0 60 Q 150 10, 300 50 Q 450 90, 600 40 Q 750 0, 900 45 Q 1050 85, 1200 50 L 1200 120 L 0 120 Z"
              />
            </svg>

            <svg
              className="dream-cloud-bank cloud-bank-bottom"
              viewBox="0 0 1200 140"
              preserveAspectRatio="none"
            >
              <path
                className="cloud-shape-path"
                d="M 0 70 Q 180 120, 360 65 Q 540 10, 720 70 Q 900 125, 1080 60 Q 1140 30, 1200 50 L 1200 140 L 0 140 Z"
              />
            </svg>
          </div>

          {/* Layer 3: Foreground Atmospheric Accents & Hanging Nursery Mobile (Purely Decorative) */}
          <div className="env-layer-fore" aria-hidden="true">
            <div className="hanging-nursery-mobile">
              <div className="mobile-string" />
              <div className="mobile-ornament">✦</div>
            </div>

            <span className="stardust-whisper whisper-1">✧</span>
            <span className="stardust-whisper whisper-2">✦</span>
          </div>
        </div>
      </div>

      {/* Secret Nursery Diary Note Easter Egg Modal */}
      {easterEggOpen && (
        <div
          className="easter-egg-backdrop"
          onClick={closeEasterEgg}
          role="dialog"
          aria-modal="true"
          aria-labelledby="easter-egg-heading"
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              closeBtnRef.current?.focus();
            }
          }}
        >
          <div
            className="easter-egg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="egg-starburst" aria-hidden="true" />
            <div className="egg-badge">
              <span>★ Secret Nursery Discovery ★</span>
            </div>

            <h3 id="easter-egg-heading" className="egg-title">
              Midnight Workshop Log #777
            </h3>

            <p className="egg-quote">
              “Tonight’s shift log: the crescent lens needed re-grinding (3.2° off true). Adjusted the bronze spring two clicks clockwise. Tested lullaby resonance on the workshop cat — she purred at measure seven, which is a good sign. One sleepy child on Cloud Route 4 smiled in their sleep at 02:47 AM. I think that was my favorite part of the whole shift.” — Pip
            </p>

            <p className="egg-note-sub">
              You found Pip’s private shift diary. These notes are written in very small handwriting between the lines of the official maintenance log. Pip doesn’t usually show them to anyone — but you tapped the moon, so you must be a friend.
            </p>

            <button
              ref={closeBtnRef}
              type="button"
              className="egg-close-btn"
              onClick={closeEasterEgg}
              autoFocus
            >
              Keep Pip’s Secret [Esc]
            </button>
          </div>
        </div>
      )}
    </>
  );
}
