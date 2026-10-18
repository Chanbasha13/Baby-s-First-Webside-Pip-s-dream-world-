import React, { useState, useEffect } from 'react';
import { SecretClueButton } from '../components/SecretDreamQuest';

function Scene4DeliveryIllustration() {
  return (
    <svg
      viewBox="0 0 360 260"
      className="scene-artwork-img"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a gentle dream delivery cloud route leading to Pillow Haven"
    >
      <rect width="360" height="260" rx="20" fill="var(--color-bg)" />
      
      {/* Soft Constellation Grid */}
      <circle cx="80" cy="50" r="1.5" fill="var(--color-accent-gold)" />
      <circle cx="280" cy="40" r="1.5" fill="var(--color-accent-gold)" />
      <circle cx="320" cy="180" r="1.5" fill="var(--color-accent-gold)" />

      {/* Cloud 1: Launch Cloud */}
      <path
        d="M 40 160 C 30 130, 70 110, 90 130 C 110 100, 160 110, 160 140 C 180 140, 190 170, 170 180 C 150 190, 50 190, 40 160 Z"
        fill="var(--color-surface)"
        stroke="var(--color-border-warm)"
        strokeWidth="1.5"
      />
      <text x="65" y="155" fill="var(--color-text-main)" fontSize="10" fontFamily="var(--font-playful-rounded)" fontWeight="600">
        Nursery Eaves
      </text>

      {/* Curved Stardust Flight Path */}
      <path
        d="M 120 125 C 160 70, 220 70, 260 140"
        stroke="var(--color-berry)"
        strokeWidth="2.5"
        strokeDasharray="5 5"
        fill="none"
      />

      {/* Little Floating Dream Capsule / Parcel */}
      <g transform="translate(180, 85)">
        <circle cx="0" cy="0" r="14" fill="var(--color-accent-gold-soft)" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
        <text x="-6" y="5" fill="var(--color-berry)" fontSize="14" fontFamily="sans-serif">✦</text>
        <path d="M -8 18 Q 0 28, 8 18" stroke="var(--color-accent-gold)" strokeWidth="1.5" fill="none" />
      </g>

      {/* Cloud 2: Pillow Haven Destination */}
      <path
        d="M 220 180 C 210 150, 250 130, 275 150 C 295 120, 340 130, 340 160 C 355 165, 355 190, 335 195 C 315 200, 230 200, 220 180 Z"
        fill="var(--color-surface)"
        stroke="var(--color-accent-sky-border)"
        strokeWidth="1.5"
      />
      <text x="250" y="175" fill="var(--color-berry)" fontSize="10.5" fontFamily="var(--font-playful-rounded)" fontWeight="700">
        Pillow Haven ★
      </text>

      {/* Dawn Horizon Glow */}
      <path d="M 20 235 L 340 235" stroke="var(--color-border-dashed)" strokeDasharray="4 4" strokeWidth="1" />
      <text x="135" y="248" fill="var(--color-text-light)" fontSize="9" fontFamily="var(--font-playful-rounded)">
        Dawn Airway Corridor · 04:30 AM
      </text>
    </svg>
  );
}

export default function OriginStorySection() {
  const [activeScene, setActiveScene] = useState(1);
  const [visibleScenes, setVisibleScenes] = useState(() => new Set([1]));

  // Set up IntersectionObserver to update active scene on scroll and reveal scenes
  useEffect(() => {
    const sceneElements = document.querySelectorAll('.story-scene-row');
    if (!sceneElements.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sceneId = parseInt(entry.target.getAttribute('data-scene'), 10);
            if (sceneId) {
              setActiveScene(sceneId);
              setVisibleScenes((prev) => {
                if (prev.has(sceneId)) return prev;
                const next = new Set(prev);
                next.add(sceneId);
                return next;
              });
            }
          }
        });
      },
      { rootMargin: '-10% 0px -40% 0px' }
    );

    sceneElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToScene = (sceneNum) => {
    setActiveScene(sceneNum);
    setVisibleScenes((prev) => {
      if (prev.has(sceneNum)) return prev;
      const next = new Set(prev);
      next.add(sceneNum);
      return next;
    });
    const target = document.getElementById(`scene-${sceneNum}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scenes = [
    {
      id: 1,
      numberLabel: 'Scene 01',
      location: 'Midnight Nursery Eaves',
      title: 'The First Little Star',
      description:
        'Late one quiet shift, Pip noticed a tiny, solitary star drifting just past the nursery rafters. Its pulse was pale and uneven, caught in a tangle of cold mist. Pip wondered whether fading dreams could be repaired with gentle patience, rather than left to wander the empty dark alone.',
      artwork: (
        <div className="scene-artwork-frame scene-frame-portrait">
          <SecretClueButton clueId="star" className="secret-clue-star" />
          <img
            src="/assets/pip_portrait.png"
            alt="Pip inspecting the first little star in the nursery attic"
            className="scene-artwork-img"
            width={682}
            height={1024}
            loading="lazy"
          />
        </div>
      ),
      specs: [
        { key: 'Subject', val: 'Orion Minor Drift #04' },
        { key: 'Condition', val: 'Luminance dim · Pulse 22%' },
        { key: 'Pip’s Resolution', val: 'Every star deserves safe repair' },
      ],
    },
    {
      id: 2,
      numberLabel: 'Scene 02',
      location: 'Workbench Station #07',
      title: 'The Lullaby Workshop',
      description:
        'Pip spread tiny brass watchmaker tools across the workbench. By tuning phosphor-bronze bells to celestial harmonics and housing them in a hand-carved music box, Pip crafted melodies weighted to slow rapid thoughts and encourage deep, rhythmic slumber.',
      artwork: (
        <div className="scene-artwork-frame scene-frame-workbench">
          <div className="floating-notes-anim" aria-hidden="true">
            <span className="floating-note note-1">♪</span>
            <span className="floating-note note-2">♫</span>
            <span className="floating-note note-3">♩</span>
          </div>
          <img
            src="/assets/pip_lullaby_box.png"
            alt="The Lullaby Lab star-chime music box on Pip's workbench"
            className="scene-artwork-img"
            width={1024}
            height={924}
            loading="lazy"
          />
        </div>
      ),
      specs: [
        { key: 'Acoustic Base', val: '432 Hz Harmonic Minor' },
        { key: 'Mechanism', val: '12 Phosphor-Bronze Winding Tines' },
        { key: 'Target Effect', val: 'Tranquil breathing within 3 minutes' },
      ],
    },
    {
      id: 3,
      numberLabel: 'Scene 03',
      location: 'Optical Comfort Bay',
      title: 'A Lantern for the Dark',
      description:
        'Recognizing that bedtime darkness can feel unfamiliar and overwhelming, Pip gathered amber starlight into crescent nightlights. Designed to dissolve harsh closet shadows without disrupting sleepy eyelids, the lanterns made nighttime feel like a soft, cozy blanket.',
      artwork: (
        <div className="scene-artwork-frame scene-frame-lantern">
          <img
            src="/assets/pip_dream_lantern.png"
            alt="Pip's glowing crescent moon nightlight lantern"
            className="scene-artwork-img"
            width={1024}
            height={914}
            loading="lazy"
          />
        </div>
      ),
      specs: [
        { key: 'Lens Geometry', val: 'Hand-Curved Crescent Prism' },
        { key: 'Color Temp', val: '2200K Non-Flicker Candlelight' },
        { key: 'Comfort Rating', val: '100% Shadow-Dispelling' },
      ],
    },
    {
      id: 4,
      numberLabel: 'Scene 04',
      location: 'Skyway Launch Corridor',
      title: 'The Dream Delivery',
      description:
        'With lullabies wound and lanterns glowing, Pip mapped safe airway corridors between the cloud banks. Bypassing cold turbulence, gentle glider skiffs ferry carefully wrapped dreams directly to sleeping pillows before dawn paints the sky.',
      artwork: (
        <div className="scene-artwork-frame scene-frame-route">
          <Scene4DeliveryIllustration />
        </div>
      ),
      specs: [
        { key: 'Launch Route', val: 'Cloud #09 ➔ Velvet Valley ➔ Pillow Haven' },
        { key: 'Altitude', val: 'Sub-Storm Cirrus Glide' },
        { key: 'Delivery ETA', val: 'Promptly before first morning light' },
      ],
    },
  ];

  return (
    <section id="story" className="story-section">
      <div className="container">
        {/* Section Header */}
        <div className="story-header-block">
          <div className="storybook-chapter-folio">
            <span className="chapter-roman-numeral">CHAPTER I</span>
            <span className="chapter-folio-divider" aria-hidden="true">❖</span>
            <span className="chapter-folio-tag">The Origin Chronicle</span>
          </div>
          <h2 className="story-main-title">Every dream begins somewhere.</h2>
          <p className="story-main-subtitle">
            Follow Pip’s journey from curious attic star-gazer to Midnight Nursery
            dream engineer through four quiet, comforting scenes.
          </p>

          <div className="storybook-floret-divider" aria-hidden="true">
            <span className="floret-line" />
            <span className="floret-glyph">✦ ❖ ✦</span>
            <span className="floret-line" />
          </div>

          {/* Timeline Tracker Navigation */}
          <nav className="story-timeline-nav" aria-label="Story chapter progress">
            {scenes.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`timeline-btn ${activeScene === s.id ? 'is-active' : ''}`}
                onClick={() => scrollToScene(s.id)}
                aria-current={activeScene === s.id ? 'step' : undefined}
                aria-label={`Jump to ${s.numberLabel}: ${s.title}`}
              >
                <span aria-hidden="true">{activeScene === s.id ? '●' : '○'}</span>
                <span>Scene 0{s.id}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 4 Story Scenes with Alternating Layouts */}
        <div className="story-scenes-stack">
          {scenes.map((scene, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <article
                key={scene.id}
                id={`scene-${scene.id}`}
                data-scene={scene.id}
                className={`story-scene-row ${isReversed ? 'scene-reversed' : ''} ${visibleScenes.has(scene.id) ? 'scene-revealed' : ''}`}
              >
                {/* Visual Media Column */}
                <div className="scene-visual-wrap" data-tilt="primary">{scene.artwork}</div>

                {/* Narrative Text Column */}
                <div className="scene-text-content">
                  <div className="scene-header-meta">
                    <span className="scene-number-badge">{scene.numberLabel}</span>
                    <span className="scene-location-tag">✦ {scene.location}</span>
                  </div>

                  <h3 className="scene-title">{scene.title}</h3>
                  <p className="scene-description">{scene.description}</p>

                  {/* Pip's Handwritten Workshop Field Notes */}
                  <div className="scene-field-specs" data-tilt="secondary">
                    <div className="scene-field-specs-header">
                      <span className="notes-quill-icon" aria-hidden="true">✎</span>
                      <span>Pip’s Workshop Field Notes</span>
                    </div>
                    {scene.specs.map((item) => (
                      <div key={item.key} className="spec-entry">
                        <span className="spec-entry-key">{item.key}:</span>
                        <span className="spec-entry-val">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Storybook Connector to Chapter II */}
        <div className="storybook-chapter-transition" aria-hidden="true">
          <span className="transition-ornament">✦ · · · · · · ❖ · · · · · · ✦</span>
        </div>
      </div>
    </section>
  );
}

