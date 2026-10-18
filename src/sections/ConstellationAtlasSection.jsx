import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playGentleChime, isSoundEnabled } from '../utils/chimes';
import { usePipPersonality } from '../context/PipPersonalityContext';
import { CONSTELLATIONS } from '../data/constellations';

export default function ConstellationAtlasSection() {
  const {
    hasUnlockedMoonSecret,
    hasCompletedGame,
    discoveredConstellations,
    recordConstellationDiscovered,
    triggerConstellationExplored,
  } = usePipPersonality();

  const [selectedId, setSelectedId] = useState('lyra');
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const mapContainerRef = useRef(null);

  // Helper: Determine if constellation is unlocked
  const isUnlocked = useCallback(
    (item) => {
      if (item.unlockType === 'default') return true;
      if (item.unlockType === 'secret_moon') return Boolean(hasUnlockedMoonSecret);
      if (item.unlockType === 'game_completion') return Boolean(hasCompletedGame);
      return true;
    },
    [hasUnlockedMoonSecret, hasCompletedGame]
  );

  const activeItem = CONSTELLATIONS.find((c) => c.id === selectedId) || CONSTELLATIONS[0];
  const activeUnlocked = isUnlocked(activeItem);

  // Auto-record discovery when selecting an unlocked constellation
  useEffect(() => {
    if (activeUnlocked && !discoveredConstellations.includes(activeItem.id)) {
      recordConstellationDiscovered(activeItem.id);
    }
  }, [activeItem.id, activeUnlocked, discoveredConstellations, recordConstellationDiscovered]);

  // Handle Constellation Selection
  const selectConstellation = (item, userTriggered = false) => {
    setSelectedId(item.id);
    const itemUnlocked = isUnlocked(item);

    if (itemUnlocked) {
      recordConstellationDiscovered(item.id);
      if (userTriggered && isSoundEnabled()) {
        playGentleChime(item.chimeFreq, 0.22);
      }
      triggerConstellationExplored(item.name, item.id === 'crescentia' || item.id === 'corona_somniorum', item.id);
      setSrAnnouncement(`Selected ${item.name}, ${item.latinSubtitle}. ${item.sector}. Discovery story card is displayed.`);
    } else {
      if (userTriggered && isSoundEnabled()) {
        playGentleChime(440, 0.15); // soft lower chime for locked mystery
      }
      setSrAnnouncement(`Selected mystery constellation ${item.name}. Status: Locked. ${item.lockedHint}`);
    }
  };

  // Keyboard navigation through arrow keys
  const handleKeyDownOnNav = (e, currentIndex) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (currentIndex + 1) % CONSTELLATIONS.length;
      selectConstellation(CONSTELLATIONS[nextIdx], true);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (currentIndex - 1 + CONSTELLATIONS.length) % CONSTELLATIONS.length;
      selectConstellation(CONSTELLATIONS[prevIdx], true);
    }
  };

  // Step through next/prev
  const stepConstellation = (delta) => {
    const currentIdx = CONSTELLATIONS.findIndex((c) => c.id === selectedId);
    const targetIdx = (currentIdx + delta + CONSTELLATIONS.length) % CONSTELLATIONS.length;
    selectConstellation(CONSTELLATIONS[targetIdx], true);
  };

  // Calculate exploration progress
  const totalCharted = CONSTELLATIONS.filter((c) => isUnlocked(c) && discoveredConstellations.includes(c.id)).length;
  const progressPercent = Math.round((totalCharted / CONSTELLATIONS.length) * 100);

  let explorerRank = 'Apprentice Stargazer';
  if (totalCharted >= 5) {
    explorerRank = 'Master Celestial Navigator';
  } else if (totalCharted >= 3) {
    explorerRank = 'Journeyman Cartographer';
  }

  return (
    <section id="constellation-atlas" className="atlas-section" aria-labelledby="atlas-heading">
      <span id="atlas" aria-hidden="true" style={{ position: 'relative', top: '-80px', display: 'block' }} />
      <div className="container">
        {/* Section Header */}
        <div className="section-header-block atlas-header-block">
          <div className="storybook-chapter-folio">
            <span className="chapter-roman-numeral">CHAPTER II</span>
            <span className="chapter-folio-divider" aria-hidden="true">❖</span>
            <span className="chapter-folio-tag">The Celestial Atlas</span>
          </div>
          <h2 id="atlas-heading" className="section-title">
            The Midnight Constellation Atlas
          </h2>
          <p className="section-description">
            Pip’s hand-inked celestial chart of the night sky. Each constellation guides a vital nursery invention,
            flight path, or secret haven. Follow the delicate starlight lines to chart Pip’s living world.
          </p>

          <div className="storybook-floret-divider" aria-hidden="true">
            <span className="floret-line" />
            <span className="floret-glyph">✦ ❖ ✦</span>
            <span className="floret-line" />
          </div>

          {/* Small Exploration Progress Meter */}
          <div className="atlas-progress-card" data-tilt="secondary" role="region" aria-label="Atlas exploration progress">
            <div className="atlas-progress-meta">
              <span className="atlas-progress-rank">
                <span className="rank-sparkle" aria-hidden="true">✦</span>
                <span>{explorerRank}</span>
              </span>
              <span className="atlas-progress-count">
                <strong>{totalCharted}</strong> of <strong>{CONSTELLATIONS.length}</strong> Constellations Charted ({progressPercent}%)
              </span>
            </div>
            <div
              className="atlas-progress-bar-track"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`Atlas exploration progress: ${progressPercent} percent`}
            >
              <div className="atlas-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            {totalCharted === CONSTELLATIONS.length && (
              <div className="atlas-all-unlocked-banner" role="status">
                <span>★ Master of the Midnight Sky! All constellations charted in Pip’s celestial canon.</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Accessible Constellation Selector Carousel / Tabs */}
        <nav className="atlas-selector-nav" aria-label="Constellation Selector Tabs">
          <ul className="atlas-selector-list" role="tablist">
            {CONSTELLATIONS.map((c, idx) => {
              const unlocked = isUnlocked(c);
              const isSelected = c.id === selectedId;
              const isCharted = unlocked && discoveredConstellations.includes(c.id);

              return (
                <li key={c.id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    id={`atlas-tab-${c.id}`}
                    aria-selected={isSelected}
                    aria-controls="atlas-discovery-panel"
                    className={`atlas-tab-btn ${isSelected ? 'is-selected' : ''} ${unlocked ? 'is-unlocked' : 'is-locked'}`}
                    onClick={() => selectConstellation(c, true)}
                    onKeyDown={(e) => handleKeyDownOnNav(e, idx)}
                  >
                    <span className="tab-glyph" aria-hidden="true">
                      {c.id === 'crescentia' ? '🌙' : c.id === 'corona_somniorum' ? '👑' : '✦'}
                    </span>
                    <span className="tab-label">{c.name}</span>
                    {unlocked ? (
                      isCharted && <span className="tab-status-pill tab-status-charted">✓</span>
                    ) : (
                      <span className="tab-status-pill tab-status-lock" title="Mystery locked">🔒</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Interactive SVG Constellation Map Canvas */}
        <div className="atlas-map-wrapper" ref={mapContainerRef}>
          <div className="atlas-map-frame">
            <svg
              className="atlas-celestial-svg"
              viewBox="0 0 1000 620"
              preserveAspectRatio="xMidYMid meet"
              role="region"
              aria-label="Interactive Midnight Constellation Map. Select constellations with pointer or keyboard."
            >
              <defs>
                {/* Sky gradients */}
                <radialGradient id="atlas-sky-radial" cx="50%" cy="45%" r="65%">
                  <stop offset="0%" stopColor="#1e1836" />
                  <stop offset="55%" stopColor="#130e24" />
                  <stop offset="100%" stopColor="#0b0817" />
                </radialGradient>

                <radialGradient id="nebula-rose" cx="30%" cy="30%" r="45%">
                  <stop offset="0%" stopColor="rgba(163, 64, 99, 0.22)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                <radialGradient id="nebula-gold" cx="75%" cy="65%" r="45%">
                  <stop offset="0%" stopColor="rgba(244, 178, 72, 0.18)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Starlight Glow Filters */}
                <filter id="star-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="2.4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <filter id="moon-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Sky Backdrop */}
              <rect width="1000" height="620" rx="20" fill="url(#atlas-sky-radial)" />
              <rect width="1000" height="620" rx="20" fill="url(#nebula-rose)" pointerEvents="none" />
              <rect width="1000" height="620" rx="20" fill="url(#nebula-gold)" pointerEvents="none" />

              {/* Astrolabe & Cartographic Coordinate Guides (Delicate line work) */}
              <g className="atlas-coordinate-grid" pointerEvents="none" aria-hidden="true">
                {/* Concentric Celestial Orbit Rings */}
                <circle cx="500" cy="310" r="140" stroke="rgba(235, 213, 197, 0.12)" strokeWidth="1" strokeDasharray="4 6" fill="none" />
                <circle cx="500" cy="310" r="260" stroke="rgba(235, 213, 197, 0.10)" strokeWidth="1" strokeDasharray="3 5" fill="none" />
                <circle cx="500" cy="310" r="390" stroke="rgba(235, 213, 197, 0.08)" strokeWidth="1" strokeDasharray="2 4" fill="none" />

                {/* Axis lines */}
                <line x1="60" y1="310" x2="940" y2="310" stroke="rgba(235, 213, 197, 0.09)" strokeWidth="1" strokeDasharray="4 8" />
                <line x1="500" y1="40" x2="500" y2="580" stroke="rgba(235, 213, 197, 0.09)" strokeWidth="1" strokeDasharray="4 8" />

                {/* Decorative border ticks */}
                <rect x="14" y="14" width="972" height="592" rx="14" fill="none" stroke="rgba(244, 178, 72, 0.28)" strokeWidth="1.2" />
                <rect x="20" y="20" width="960" height="580" rx="10" fill="none" stroke="rgba(235, 213, 197, 0.14)" strokeWidth="0.8" strokeDasharray="6 4" />

                {/* Compass Florette / Astrolabe Rose (Bottom Left) */}
                <g transform="translate(68, 545)">
                  <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(244, 178, 72, 0.35)" strokeWidth="0.8" />
                  <path d="M 0 -22 L 3 -7 L 18 -18 L 7 -3 L 22 0 L 7 3 L 18 18 L 3 7 L 0 22 L -3 7 L -18 18 L -7 3 L -22 0 L -7 -3 L -18 -18 L -3 -7 Z" fill="rgba(244, 178, 72, 0.22)" />
                  <text x="0" y="-25" textAnchor="middle" fill="rgba(244, 178, 72, 0.7)" fontSize="9" fontFamily="sans-serif">N</text>
                  <text x="0" y="33" textAnchor="middle" fill="rgba(244, 178, 72, 0.5)" fontSize="8" fontFamily="sans-serif">S</text>
                </g>

                {/* Cartographic Title Stamp (Top Left) */}
                <g transform="translate(42, 52)">
                  <text x="0" y="0" fill="rgba(244, 178, 72, 0.85)" fontSize="11" fontWeight="700" letterSpacing="0.1em" fontFamily="serif">CHART NO. 07 · MIDNIGHT NURSERY</text>
                  <text x="0" y="14" fill="rgba(235, 213, 197, 0.45)" fontSize="9" letterSpacing="0.05em" fontFamily="sans-serif">EPOCH J2026.5 · CELESTIAL CANON</text>
                </g>
              </g>

              {/* Celestial Moon (Upper Right) */}
              <g
                className="atlas-celestial-moon"
                transform="translate(895, 75)"
                role="button"
                tabIndex={0}
                aria-label="Crescent Moon Celestial Guide. Tap to view lunar log notes."
                onClick={() => {
                  if (hasUnlockedMoonSecret) {
                    selectConstellation(CONSTELLATIONS.find((c) => c.id === 'crescentia'), true);
                  } else {
                    setSrAnnouncement('The Crescent Moon whispers: Find Pip’s secret log by tapping the moon in the top canopy 3 times!');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (hasUnlockedMoonSecret) {
                      selectConstellation(CONSTELLATIONS.find((c) => c.id === 'crescentia'), true);
                    }
                  }
                }}
              >
                <circle cx="0" cy="0" r="32" fill="none" stroke="rgba(244, 178, 72, 0.15)" strokeWidth="1" />
                <path
                  d="M 10 -20 A 24 24 0 1 0 22 20 A 20 20 0 0 1 10 -20 Z"
                  fill="#fff4d4"
                  filter="url(#moon-glow)"
                />
                <circle cx="12" cy="-18" r="1.5" fill="#ffffff" />
                <circle cx="18" cy="18" r="1.2" fill="#ffffff" />
              </g>

              {/* Storybook Cloud Banks (Delicate decorative paths) */}
              <g className="atlas-clouds-layer" pointerEvents="none" aria-hidden="true">
                {/* Cloud Bank Top-Center */}
                <path
                  d="M 320 30 Q 360 12, 410 24 Q 450 6, 500 20 Q 560 10, 610 28 Q 660 18, 700 36 L 700 0 L 320 0 Z"
                  fill="rgba(255, 248, 241, 0.04)"
                  stroke="rgba(235, 213, 197, 0.08)"
                  strokeWidth="0.8"
                />
                {/* Cloud Bank Bottom-Right */}
                <path
                  d="M 640 600 Q 700 560, 780 575 Q 840 545, 910 568 Q 970 550, 1000 580 L 1000 620 L 640 620 Z"
                  fill="rgba(255, 248, 241, 0.04)"
                  stroke="rgba(235, 213, 197, 0.08)"
                  strokeWidth="0.8"
                />
              </g>

              {/* Ambient Micro-Stars (Non-interactive twinkling stardust) */}
              <g className="atlas-ambient-stars" pointerEvents="none" aria-hidden="true">
                <circle cx="95" cy="220" r="1.2" fill="#fff5ed" opacity="0.45" />
                <circle cx="340" cy="180" r="1.5" fill="#ffd166" opacity="0.55" />
                <circle cx="380" cy="290" r="1.0" fill="#fff5ed" opacity="0.35" />
                <circle cx="630" cy="270" r="1.4" fill="#ffd166" opacity="0.5" />
                <circle cx="660" cy="95" r="1.2" fill="#fff5ed" opacity="0.4" />
                <circle cx="930" cy="230" r="1.5" fill="#fff5ed" opacity="0.5" />
                <circle cx="120" cy="510" r="1.2" fill="#ffd166" opacity="0.45" />
                <circle cx="350" cy="530" r="1.4" fill="#fff5ed" opacity="0.4" />
                <circle cx="680" cy="510" r="1.2" fill="#ffd166" opacity="0.5" />
                <circle cx="930" cy="490" r="1.4" fill="#fff5ed" opacity="0.45" />
              </g>

              {/* Render Constellations */}
              {CONSTELLATIONS.map((c) => {
                const isSelected = c.id === selectedId;
                const unlocked = isUnlocked(c);

                return (
                  <g
                    key={c.id}
                    id={`constellation-group-${c.id}`}
                    className={`atlas-constellation-group ${isSelected ? 'is-selected' : ''} ${unlocked ? 'is-unlocked' : 'is-locked'}`}
                  >
                    {/* Constellation Connecting Lines */}
                    <g className="constellation-lines-layer" pointerEvents="none" aria-hidden="true">
                      {c.lines.map(([x1, y1, x2, y2], lIdx) => (
                        <line
                          key={`line-${lIdx}`}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          className={`constellation-line ${isSelected ? 'line-selected' : ''} ${!unlocked ? 'line-locked' : ''}`}
                        />
                      ))}

                      {/* Optional interior strings / jetstream paths */}
                      {c.strings &&
                        c.strings.map(([x1, y1, x2, y2], sIdx) => (
                          <line
                            key={`str-${sIdx}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            className={`constellation-string ${isSelected ? 'string-selected' : ''}`}
                            strokeDasharray="2 3"
                          />
                        ))}

                      {c.jetstream &&
                        c.jetstream.map(([x1, y1, x2, y2], jIdx) => (
                          <line
                            key={`jet-${jIdx}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            className="constellation-jetstream"
                            strokeDasharray="3 4"
                          />
                        ))}
                    </g>

                    {/* Active Selection Orbital Reticle around Constellation Center */}
                    {isSelected && (
                      <g className="atlas-selection-reticle" transform={`translate(${c.center.x}, ${c.center.y})`} pointerEvents="none" aria-hidden="true">
                        <circle cx="0" cy="0" r="76" className="reticle-orbit" />
                        <circle cx="0" cy="0" r="84" className="reticle-outer" strokeDasharray="4 6" />
                        <line x1="-90" y1="0" x2="-78" y2="0" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
                        <line x1="78" y1="0" x2="90" y2="0" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
                        <line x1="0" y1="-90" x2="0" y2="-78" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
                        <line x1="0" y1="78" x2="0" y2="90" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
                      </g>
                    )}

                    {/* Star Nodes */}
                    <g className="constellation-stars-layer">
                      {c.stars.map((s) => {
                        return (
                          <g key={s.id} className="constellation-star-node">
                            {/* Halo */}
                            <circle
                              cx={s.x}
                              cy={s.y}
                              r={s.r * 2.2}
                              className={`star-halo ${isSelected ? 'halo-active' : ''} ${!unlocked ? 'halo-locked' : ''}`}
                              pointerEvents="none"
                            />
                            {/* Star Body */}
                            <circle
                              cx={s.x}
                              cy={s.y}
                              r={s.r}
                              className={`star-core ${s.isPrimary ? 'star-core-primary' : ''} ${!unlocked ? 'core-locked' : ''}`}
                              filter={unlocked ? 'url(#star-glow)' : undefined}
                              pointerEvents="none"
                            />
                            {/* Faceted sparkle glint on primary stars */}
                            {s.isPrimary && unlocked && (
                              <polygon
                                points={`${s.x},${s.y - s.r * 2} ${s.x + s.r * 0.7},${s.y} ${s.x},${s.y + s.r * 2} ${s.x - s.r * 0.7},${s.y}`}
                                fill="#ffffff"
                                opacity="0.85"
                                pointerEvents="none"
                              />
                            )}
                          </g>
                        );
                      })}
                    </g>

                    {/* Constellation Name Label in Map Canvas */}
                    <text
                      x={c.center.x}
                      y={c.center.y + 68}
                      className={`constellation-map-label ${isSelected ? 'label-selected' : ''}`}
                      textAnchor="middle"
                      pointerEvents="none"
                      aria-hidden="true"
                    >
                      {unlocked ? c.name : `🔒 ${c.name}`}
                    </text>

                    {/* Generous Accessible Click/Touch Hit Area Button */}
                    <circle
                      cx={c.center.x}
                      cy={c.center.y}
                      r="65"
                      className="constellation-hit-target"
                      role="button"
                      tabIndex={0}
                      aria-label={`${c.name}, ${c.latinSubtitle}. ${unlocked ? 'Charted.' : 'Locked mystery.'} Tap to view story card.`}
                      aria-pressed={isSelected}
                      onClick={() => selectConstellation(c, true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          selectConstellation(c, true);
                        }
                      }}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Constellation Story & Discovery Card (Accessible panel) */}
        <div id="atlas-discovery-panel" className="atlas-discovery-card" data-tilt="primary" role="tabpanel" aria-labelledby={`atlas-tab-${activeItem.id}`}>
          <div className="discovery-card-header">
            <div className="discovery-meta-left">
              <span className="badge badge-berry">{activeItem.sector}</span>
              <span className="discovery-coords">{activeItem.coordinates}</span>
            </div>

            <div className="discovery-meta-right">
              {activeUnlocked ? (
                <span className="discovery-status-pill pill-charted">
                  <span className="status-dot" aria-hidden="true">●</span>
                  <span>{activeItem.unlockType === 'default' ? 'Charted in Atlas' : 'Secret Discovered'}</span>
                </span>
              ) : (
                <span className="discovery-status-pill pill-locked">
                  <span className="status-dot" aria-hidden="true">🔒</span>
                  <span>Mystery Shrouded</span>
                </span>
              )}
            </div>
          </div>

          <div className="discovery-card-body">
            <div className="discovery-title-row">
              <div>
                <h3 className="discovery-title">{activeItem.name}</h3>
                <p className="discovery-subtitle">{activeItem.latinSubtitle}</p>
              </div>

              {/* Constellation Token Glyph */}
              <div className="discovery-glyph-wrap" aria-hidden="true">
                <span className="discovery-glyph">
                  {activeItem.id === 'crescentia' ? '🌙' : activeItem.id === 'corona_somniorum' ? '👑' : '✦'}
                </span>
              </div>
            </div>

            {/* Narrative / Lore Content */}
            {activeUnlocked ? (
              <>
                <p className="discovery-lore">{activeItem.lore}</p>
                <blockquote className="discovery-quote">
                  <p>{activeItem.quote}</p>
                </blockquote>
              </>
            ) : (
              <div className="discovery-locked-box">
                <div className="locked-icon" aria-hidden="true">🔒</div>
                <div className="locked-text">
                  <h4 className="locked-title">Constellation Coordinates Shrouded</h4>
                  <p className="locked-hint">{activeItem.lockedHint}</p>
                </div>
              </div>
            )}

            {/* Direct Link to Connected Feature in Dream World */}
            <div className="discovery-footer-row">
              <div className="discovery-link-context">
                <span className="link-context-label">Dream Realm Connection:</span>
                <span className="link-context-name">{activeItem.linkedFeature}</span>
              </div>

              <div className="discovery-actions">
                <a
                  href={activeItem.targetHref}
                  className={`btn ${activeUnlocked ? 'btn-primary' : 'btn-secondary'} discovery-cta-btn`}
                  onClick={() => {
                    if (isSoundEnabled()) {
                      playGentleChime(activeItem.chimeFreq, 0.18);
                    }
                  }}
                >
                  <span>{activeUnlocked ? (activeItem.ctaUnlockedText || activeItem.ctaText) : activeItem.ctaText}</span>
                  <span aria-hidden="true">➔</span>
                </a>
              </div>
            </div>
          </div>

          {/* Storybook Pagination Footer (Previous / Next Constellation) */}
          <div className="discovery-pagination-bar">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => stepConstellation(-1)}
              aria-label="Previous constellation in atlas"
            >
              <span aria-hidden="true">◀</span>
              <span>Previous Star</span>
            </button>

            <span className="pagination-indicator">
              Constellation {CONSTELLATIONS.findIndex((c) => c.id === selectedId) + 1} of {CONSTELLATIONS.length}
            </span>

            <button
              type="button"
              className="pagination-btn"
              onClick={() => stepConstellation(1)}
              aria-label="Next constellation in atlas"
            >
              <span>Next Star</span>
              <span aria-hidden="true">▶</span>
            </button>
          </div>
        </div>

        {/* Screen Reader Live Announcement */}
        <div className="sr-only" aria-live="polite" role="status">
          {srAnnouncement}
        </div>

        {/* Storybook Connector to Chapter III */}
        <div className="storybook-chapter-transition" aria-hidden="true">
          <span className="transition-ornament">✦ · · · · · · ❖ · · · · · · ✦</span>
        </div>
      </div>
    </section>
  );
}

