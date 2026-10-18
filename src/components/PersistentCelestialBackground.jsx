import React from 'react';

/**
 * PersistentCelestialBackground
 * 
 * Shared fixed decorative layer positioned behind the entire page content.
 * Remains visible during scrolling across every section and route, weaving
 * subtle constellation trails, soft peach/gold atmospheric nebulae, and
 * glowing celestial focal stars across the margins of the dream world.
 * 
 * Fully accessible: aria-hidden="true", pointer-events: none,
 * zero interference with text or buttons, and prefers-reduced-motion safe.
 */
export default function PersistentCelestialBackground() {
  return (
    <div className="persistent-celestial-canvas pip-celestial-canvas-fixed" aria-hidden="true">
      {/* 1. Atmospheric Ambient Lighting Glows */}
      <div className="persistent-nebula persistent-nebula-peach" />
      <div className="persistent-nebula persistent-nebula-berry" />
      <div className="persistent-nebula persistent-nebula-gold" />

      {/* 2. Persistent Constellation Map & Curved Dashed Trails */}
      <svg
        className="persistent-constellation-svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="nodeGlowGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent-gold)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-accent-gold)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nodeGlowBerry" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-berry)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--color-berry)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Trail 1: Weaving through the left celestial margin */}
        <path
          className="persistent-trail persistent-trail-left"
          d="M 90 30 C 50 180, 160 340, 110 500 S 150 720, 80 880"
        />
        {/* Trail 2: Floating along the upper celestial arch */}
        <path
          className="persistent-trail persistent-trail-top"
          d="M 280 45 C 500 110, 820 30, 1080 75 S 1320 40, 1400 95"
        />
        {/* Trail 3: Cascading through the right celestial margin */}
        <path
          className="persistent-trail persistent-trail-right"
          d="M 1340 160 C 1410 320, 1310 490, 1370 660 S 1290 810, 1350 880"
        />
        {/* Trail 4: Gentle diagonal bridge connecting mid-sky */}
        <path
          className="persistent-trail persistent-trail-cross"
          d="M 140 380 Q 280 440, 420 410"
        />

        {/* Glowing Constellation Nodes along trails */}
        <circle cx="90" cy="30" r="3.5" className="persistent-node node-gold" />
        <circle cx="110" cy="500" r="3" className="persistent-node node-berry" />
        <circle cx="80" cy="880" r="3.5" className="persistent-node node-gold" />

        <circle cx="280" cy="45" r="3" className="persistent-node node-gold" />
        <circle cx="1080" cy="75" r="3.5" className="persistent-node node-gold" />
        <circle cx="1400" cy="95" r="3" className="persistent-node node-berry" />

        <circle cx="1340" cy="160" r="3.5" className="persistent-node node-gold" />
        <circle cx="1370" cy="660" r="3" className="persistent-node node-berry" />
        <circle cx="1350" cy="880" r="3.5" className="persistent-node node-gold" />

        <circle cx="420" cy="410" r="2.5" className="persistent-node node-gold" />
      </svg>

      {/* 3. Viewport Margin Celestial Focal Stars & Twinkles */}
      <div className="persistent-stars-layer">
        {/* Top-Right Celestial Compass Focal Star */}
        <div className="persistent-star star-focal-top-right">
          <span className="star-halo" />
          <span className="star-glyph">✦</span>
        </div>

        {/* Upper-Left Radiant Diamond Star */}
        <div className="persistent-star star-diamond-top-left">
          <span className="star-halo" />
          <span className="star-glyph">✧</span>
        </div>

        {/* Mid-Left Radiant Starlight Cluster */}
        <div className="persistent-star star-cluster-mid-left">
          <span className="star-glyph glyph-main">✵</span>
          <span className="star-glyph glyph-sparkle">·</span>
        </div>

        {/* Mid-Right Gold Pin Star */}
        <div className="persistent-star star-gold-mid-right">
          <span className="star-halo" />
          <span className="star-glyph">★</span>
        </div>

        {/* Lower-Left Distant Diamond */}
        <div className="persistent-star star-diamond-bot-left">
          <span className="star-glyph">✧</span>
        </div>

        {/* Lower-Right Celestial 8-Point Star */}
        <div className="persistent-star star-focal-bot-right">
          <span className="star-halo" />
          <span className="star-glyph">✦</span>
        </div>

        {/* Subtle Ambient Stardust Points */}
        <span className="persistent-mote mote-1">·</span>
        <span className="persistent-mote mote-2">⋆</span>
        <span className="persistent-mote mote-3">·</span>
        <span className="persistent-mote mote-4">⋆</span>
        <span className="persistent-mote mote-5">·</span>
      </div>
    </div>
  );
}
