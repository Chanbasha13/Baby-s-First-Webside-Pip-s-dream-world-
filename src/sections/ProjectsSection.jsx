import React, { useState, useEffect, useRef } from 'react';
import { playGentleChime } from '../utils/chimes';
import { usePipPersonality } from '../context/PipPersonalityContext';

// ==========================================================================
// Web Audio API Synthesizer for Lullaby Lab
// Pure Web Audio: No external libraries, user-initiated, clean resource cleanup
// ==========================================================================
const LULLABY_NOTES = [
  523.25, // C5
  659.25, // E5
  783.99, // G5
  880.00, // A5
  1046.50, // C6
  783.99, // G5
  659.25, // E5
  523.25, // C5
];

function useLullabyAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);
  const [audioError, setAudioError] = useState(null);
  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);
  const noteIndexRef = useRef(0);

  useEffect(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      setAudioSupported(false);
      setAudioError('Web Audio API is not supported on this device.');
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // Ignored
        }
        audioCtxRef.current = null;
      }
    };
  }, []);

  const playChimeNote = (freq, ctx) => {
    try {
      if (!ctx || ctx.state !== 'running') return;
      const now = ctx.currentTime;

      // Primary chime oscillator (sine)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Subtle harmonic bell overtone
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2.76, now); // Metallic chime ratio

      // Volume envelope: soft attack, natural exponential bell decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.26, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      overtoneGain.gain.setValueAtTime(0.0001, now);
      overtoneGain.gain.linearRampToValueAtTime(0.045, now + 0.02);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      overtone.connect(overtoneGain);
      gain.connect(ctx.destination);
      overtoneGain.connect(ctx.destination);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + 0.7);
      overtone.stop(now + 0.4);

      // Clean up audio nodes after playback ends
      setTimeout(() => {
        try {
          osc.disconnect();
          gain.disconnect();
          overtone.disconnect();
          overtoneGain.disconnect();
        } catch {
          // Ignored
        }
      }, 750);
    } catch {
      // Audio error handling
    }
  };

  const start = async () => {
    setAudioError(null);
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        setAudioSupported(false);
        setAudioError('Web Audio API is not supported on this browser.');
        return;
      }

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      if (audioCtxRef.current.state !== 'running') {
        throw new Error('AudioContext failed to transition to running state');
      }

      setIsPlaying(true);
      noteIndexRef.current = 0;

      const scheduleLoop = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
        const note = LULLABY_NOTES[noteIndexRef.current];
        playChimeNote(note, audioCtxRef.current);

        noteIndexRef.current = (noteIndexRef.current + 1) % LULLABY_NOTES.length;
        timerRef.current = setTimeout(scheduleLoop, 480);
      };

      scheduleLoop();
    } catch {
      setIsPlaying(false);
      setAudioError('Audio blocked by browser policy. Tap to retry.');
    }
  };

  const stop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      try {
        audioCtxRef.current.suspend().catch(() => {});
      } catch {
        // Ignored
      }
    }
    setIsPlaying(false);
  };

  const toggle = () => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  };

  return { isPlaying, toggle, audioSupported, audioError };
}

// ==========================================================================
// Project 01: Lullaby Lab Showcase
// ==========================================================================
function LullabyLabShowcase() {
  const { isPlaying, toggle, audioSupported, audioError } = useLullabyAudio();
  const [specsOpen, setSpecsOpen] = useState(false);
  const { triggerProjectExplored } = usePipPersonality();

  const handleToggle = () => {
    toggle();
    if (!isPlaying) {
      triggerProjectExplored('Star chimes vibrating at 432 Hz. Pip is watching the frequency needle settle gently. ♫');
    }
  };

  return (
    <article className="project-showcase-card project-card-acoustic" data-tilt="primary">
      <div className="project-showcase-grid">
        {/* Visual & Audio Visualizer Frame */}
        <div className="lullaby-media-frame">
          <div className="project-artwork-frame project-artwork-lullaby">
            <img
              src="/assets/pip_lullaby_box.png"
              alt="The Lullaby Lab music box with golden winding key and star chimes"
              className="project-artwork-img lullaby-img"
              width={1024}
              height={924}
              loading="lazy"
            />
          </div>

          {/* Sound Waveform Visualizer */}
          <div className="lullaby-waveform-bar" aria-hidden="true">
            <span className={`wave-bar wb-1 ${isPlaying ? 'is-playing' : ''}`} />
            <span className={`wave-bar wb-2 ${isPlaying ? 'is-playing' : ''}`} />
            <span className={`wave-bar wb-3 ${isPlaying ? 'is-playing' : ''}`} />
            <span className={`wave-bar wb-4 ${isPlaying ? 'is-playing' : ''}`} />
            <span className={`wave-bar wb-5 ${isPlaying ? 'is-playing' : ''}`} />
          </div>

          {/* Interactive User-Initiated Audio Control */}
          <div className="lullaby-controls-row">
            {audioSupported ? (
              <button
                type="button"
                className={`audio-play-btn ${isPlaying ? 'is-active' : ''}`}
                onClick={handleToggle}
                aria-pressed={isPlaying}
                aria-label={isPlaying ? 'Stop Lullaby Melody' : 'Play Star-Chime Lullaby Melody'}
              >
                <span aria-hidden="true">{isPlaying ? '⏹' : '▶'}</span>
                <span>{isPlaying ? 'Stop Melody' : 'Play Star-Chime Melody'}</span>
              </button>
            ) : (
              <span className="audio-status-pill audio-pill-warning">Audio not supported on this browser</span>
            )}
            {audioError ? (
              <span className="audio-status-pill audio-pill-warning" role="alert">
                ⚠️ {audioError}
              </span>
            ) : (
              <span className={`audio-status-pill ${isPlaying ? 'is-active' : ''}`}>
                {isPlaying ? '● 432 Hz Chime Active' : '○ User-Initiated Audio'}
              </span>
            )}
          </div>
        </div>

        {/* Narrative & Specifications Body */}
        <div className="project-showcase-body">
          <span className="showcase-header-tag">Project 01 · Bedtime Harmonics</span>
          <h3 className="showcase-title">Lullaby Lab</h3>
          <p className="showcase-text">
            A tiny nursery workshop crafting key-wound music boxes tuned with celestial
            frequencies. Pip precisely files 12 phosphor-bronze tines to emit gentle
            harmonic resonances that slow restless heartbeats and coax minds into
            peaceful sleep.
          </p>

          <div className="showcase-feature-pills">
            <span className="showcase-pill">12 Tuned Star Chimes</span>
            <span className="showcase-pill">Brass Winding Key</span>
            <span className="showcase-pill">Pentatonic C-Scale</span>
            <span className="showcase-pill">Zero Battery Power</span>
          </div>

          <button
            type="button"
            className="showcase-specs-toggle-btn"
            onClick={() => setSpecsOpen((prev) => !prev)}
            aria-expanded={specsOpen}
            aria-controls="lullaby-specs-drawer"
          >
            {specsOpen ? 'Hide Engineering Notes ▲' : 'View Engineering Notes ▼'}
          </button>

          {specsOpen && (
            <div id="lullaby-specs-drawer" className="showcase-drawer-panel">
              <p className="drawer-specs-title">Acoustic Calibration Log #07</p>
              <p>
                “Tested on three restless cloud bunnies. Melodic interval structured in
                descending fifths to trigger natural parasympathetic relaxation. Brass
                casing damped with organic cotton-cloud fleece to absorb harsh mechanical clicks.”
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ==========================================================================
// Project 02: Nightlight Collection Showcase
// ==========================================================================
function NightlightCollectionShowcase() {
  const [isRadiant, setIsRadiant] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const { triggerProjectExplored } = usePipPersonality();

  const handleLanternToggle = () => {
    const next = !isRadiant;
    setIsRadiant(next);
    triggerProjectExplored(
      next
        ? 'Radiant beam engaged (3000K). Pip verified: zero closet shadows remain. ✦'
        : 'Slumber mode restored (2200K amber). Soft enough for closed eyelids. ✦'
    );
  };

  return (
    <article className="project-showcase-card project-card-lantern" data-tilt="primary">
      <div className="project-showcase-grid">
        {/* Visual Frame with Working Light/Dim Toggle */}
        <div className={`nightlight-media-frame ${isRadiant ? 'mode-bright' : 'mode-dim'}`}>
          <div className="project-artwork-frame project-artwork-nightlight">
            <div className="nightlight-halo-glow" aria-hidden="true" />
            <img
              src="/assets/pip_dream_lantern.png"
              alt="Pip's glowing crescent moon nightlight lantern"
              className="project-artwork-img nightlight-img"
              width={1024}
              height={914}
              loading="lazy"
            />
          </div>

          <div className="light-switch-wrap">
            <button
              type="button"
              className={`lantern-toggle-btn ${isRadiant ? 'is-radiant' : ''}`}
              onClick={handleLanternToggle}
              role="switch"
              aria-checked={isRadiant}
              aria-label="Toggle lantern between Gentle Nightlight and Radiant Starlight glow"
            >
              <span aria-hidden="true">{isRadiant ? '☀️' : '🌙'}</span>
              <span>{isRadiant ? 'Radiant Glow (3000K)' : 'Gentle Nightlight (2200K)'}</span>
            </button>
            <span className="audio-status-pill">
              {isRadiant ? '● Maximum Warmth' : '● Slumber Mode'}
            </span>
          </div>
        </div>

        {/* Narrative Body */}
        <div className="project-showcase-body">
          <span className="showcase-header-tag">Project 02 · Optical Comfort</span>
          <h3 className="showcase-title">Nightlight Collection</h3>
          <p className="showcase-text">
            Hand-polished crescent lanterns designed to comfort the dark without
            keeping weary eyes awake. Using a hand-cut prism lens, each lantern
            projects faint celestial constellations across nursery ceilings, dissolving
            closet shadows into gentle, familiar shapes.
          </p>

          <div className="showcase-feature-pills">
            <span className="showcase-pill">Flicker-Free Wick</span>
            <span className="showcase-pill">Crescent Moon Prism</span>
            <span className="showcase-pill">Shadow-Softening Filter</span>
            <span className="showcase-pill">Bedtime Touch Switch</span>
          </div>

          <button
            type="button"
            className="showcase-specs-toggle-btn"
            onClick={() => setSpecsOpen((prev) => !prev)}
            aria-expanded={specsOpen}
            aria-controls="nightlight-specs-drawer"
          >
            {specsOpen ? 'Hide Optics Notes ▲' : 'View Optics Notes ▼'}
          </button>

          {specsOpen && (
            <div id="nightlight-specs-drawer" className="showcase-drawer-panel">
              <p className="drawer-specs-title">Photometric Field Notes #12</p>
              <p>
                “Tested against closet shadows at 02:00 AM. Diffusion angle spans 140
                degrees, casting friendly crescent auras instead of harsh shadows. Zero
                blue-spectrum light emitted to preserve nocturnal melatonin production.”
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ==========================================================================
// Project 03: Dream Delivery Routes Showcase
// ==========================================================================
const ROUTE_STOPS = {
  cloud9: {
    id: 'cloud9',
    name: 'Cloud #09 Launch',
    coords: { x: 50, y: 145 },
    altitude: '12,000 ft (Cirrus Base)',
    note: 'The primary workshop dispatch port. Here, dreams are packed into feather-light cloud crates, certified for zero turbulence, and loaded onto outbound glider skiffs.',
  },
  velvet: {
    id: 'velvet',
    name: 'Velvet Valley',
    coords: { x: 200, y: 120 },
    altitude: '9,500 ft (Midway Thermal)',
    note: 'A serene nocturnal valley between high cloud banks. Wind drops to a gentle whisper, allowing Pip’s gliders to coast on celestial jetstreams without disturbing sleeping towns below.',
  },
  pillow: {
    id: 'pillow',
    name: 'Pillow Haven',
    coords: { x: 290, y: 85 },
    altitude: '500 ft (Touchdown Zone)',
    note: 'The final destination for all outbound dreams. Little parachutes made of starlight silk guide dreams through bedroom windows, settling gently under pillows before dawn.',
  },
};

function DreamDeliveryRoutesShowcase() {
  const [selectedStop, setSelectedStop] = useState('cloud9');
  const [specsOpen, setSpecsOpen] = useState(false);
  const { triggerProjectExplored } = usePipPersonality();

  const currentInfo = ROUTE_STOPS[selectedStop] || ROUTE_STOPS.cloud9;

  const handleWaypointSelect = (stopId) => {
    setSelectedStop(stopId);
    const freqs = { cloud9: 659.25, velvet: 783.99, pillow: 880.00 };
    if (freqs[stopId]) {
      playGentleChime(freqs[stopId], 0.18);
    }
    const routeLogNotes = {
      cloud9: 'Cloud #09 skiff bay: feather-weight crates inspected for turbulence-free glide. ✦',
      velvet: 'Velvet Valley thermal locked: gentle tailwind speed 8 knots. The valley is quiet. ✦',
      pillow: 'Pillow Haven touchdown corridor confirmed: silk parachutes primed for window drop. ✦',
    };
    triggerProjectExplored(routeLogNotes[stopId] || 'Flight trajectory nominal. ✦');
  };

  return (
    <article className="project-showcase-card project-card-drafting" data-tilt="primary">
      <div className="project-showcase-grid">
        {/* Interactive SVG Route Map Frame */}
        <div className="delivery-map-media-frame">
          <div className="project-artwork-frame project-artwork-routes">
            <svg
              viewBox="0 0 340 220"
              className="interactive-route-svg"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Interactive dream delivery map. Click waypoints to inspect flight stops."
          >
            <rect width="340" height="220" rx="16" fill="var(--color-surface)" />

            {/* Atmosphere grid lines */}
            <line x1="20" y1="50" x2="320" y2="50" stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
            <line x1="20" y1="110" x2="320" y2="110" stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
            <line x1="20" y1="170" x2="320" y2="170" stroke="var(--color-border-subtle)" strokeDasharray="3 3" />

            {/* Outbound Trajectory Path with Flowing Stardust Dash */}
            <path
              d="M 50 145 C 90 60, 160 50, 200 120 C 230 170, 280 150, 290 85"
              className="route-trajectory-path"
              stroke="var(--color-berry)"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Waypoint 1: Cloud 9 */}
            <g
              className="map-waypoint-btn"
              onClick={() => handleWaypointSelect('cloud9')}
              role="button"
              tabIndex={0}
              aria-label="Select Cloud #09 Launch waypoint"
              aria-pressed={selectedStop === 'cloud9'}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleWaypointSelect('cloud9')}
            >
              {/* Accessible 48px touch hit area */}
              <circle cx="50" cy="145" r="24" fill="transparent" pointerEvents="all" />
              {selectedStop === 'cloud9' && (
                <circle cx="50" cy="145" r="16" className="waypoint-pulse-active" stroke="var(--color-berry)" />
              )}
              <circle cx="50" cy="145" r="9" fill={selectedStop === 'cloud9' ? 'var(--color-berry)' : 'var(--color-berry-soft)'} stroke="var(--color-berry)" strokeWidth="2" />
              <circle cx="50" cy="145" r="4" fill="#ffffff" />
            </g>
            <text x="18" y="172" fill="var(--color-text-main)" fontSize="10" fontFamily="var(--font-playful-rounded)" fontWeight="600">
              Cloud #09
            </text>

            {/* Waypoint 2: Velvet Valley */}
            <g
              className="map-waypoint-btn"
              onClick={() => handleWaypointSelect('velvet')}
              role="button"
              tabIndex={0}
              aria-label="Select Velvet Valley waypoint"
              aria-pressed={selectedStop === 'velvet'}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleWaypointSelect('velvet')}
            >
              {/* Accessible 48px touch hit area */}
              <circle cx="200" cy="120" r="24" fill="transparent" pointerEvents="all" />
              {selectedStop === 'velvet' && (
                <circle cx="200" cy="120" r="16" className="waypoint-pulse-active" stroke="var(--color-accent-gold)" />
              )}
              <circle cx="200" cy="120" r="9" fill={selectedStop === 'velvet' ? 'var(--color-accent-gold)' : 'var(--color-accent-gold-soft)'} stroke="var(--color-accent-gold)" strokeWidth="2" />
              <circle cx="200" cy="120" r="4" fill="#ffffff" />
            </g>
            <text x="165" y="148" fill="var(--color-text-main)" fontSize="10" fontFamily="var(--font-playful-rounded)" fontWeight="600">
              Velvet Valley
            </text>

            {/* Waypoint 3: Pillow Haven */}
            <g
              className="map-waypoint-btn"
              onClick={() => handleWaypointSelect('pillow')}
              role="button"
              tabIndex={0}
              aria-label="Select Pillow Haven waypoint"
              aria-pressed={selectedStop === 'pillow'}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleWaypointSelect('pillow')}
            >
              {/* Accessible 48px touch hit area */}
              <circle cx="290" cy="85" r="24" fill="transparent" pointerEvents="all" />
              {selectedStop === 'pillow' && (
                <circle cx="290" cy="85" r="16" className="waypoint-pulse-active" stroke="var(--color-accent-sky)" />
              )}
              <circle cx="290" cy="85" r="10" fill={selectedStop === 'pillow' ? 'var(--color-accent-sky)' : 'var(--color-accent-sky-soft)'} stroke="var(--color-accent-sky)" strokeWidth="2" />
              <circle cx="290" cy="85" r="4.5" fill="#ffffff" />
            </g>
            <text x="245" y="66" fill="var(--color-text-main)" fontSize="10" fontFamily="var(--font-playful-rounded)" fontWeight="600">
              Pillow Haven
            </text>
          </svg>
        </div>

          {/* Destination Selector Pill Chips */}
          <div className="waypoint-selector-row">
            {Object.values(ROUTE_STOPS).map((stop) => (
              <button
                key={stop.id}
                type="button"
                className={`waypoint-chip ${selectedStop === stop.id ? 'is-active' : ''}`}
                onClick={() => handleWaypointSelect(stop.id)}
                aria-pressed={selectedStop === stop.id}
              >
                <span>{stop.name}</span>
              </button>
            ))}
          </div>

          {/* Selected Waypoint Dispatch Note */}
          <div className="route-dispatch-card" key={selectedStop}>
            <p className="dispatch-header">Waypoint Log · {currentInfo.name}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginBottom: '4px' }}>
              Altitude: {currentInfo.altitude}
            </p>
            <p>{currentInfo.note}</p>
          </div>
        </div>

        {/* Narrative Body */}
        <div className="project-showcase-body">
          <span className="showcase-header-tag">Project 03 · Celestial Logistics</span>
          <h3 className="showcase-title">Dream Delivery Routes</h3>
          <p className="showcase-text">
            Nocturnal airway routes charted across velvet cloud banks. Bypassing
            thunderstorm altitudes, Pip maps smooth glider courses ensuring sweet
            dreams, cozy memories, and bedtime lullabies reach sleeping children
            safely before morning light.
          </p>

          <div className="showcase-feature-pills">
            <span className="showcase-pill">Zero Turbulence</span>
            <span className="showcase-pill">Stardust Glide Propulsion</span>
            <span className="showcase-pill">Sub-Storm Altitudes</span>
            <span className="showcase-pill">Pillow-Touch Precision</span>
          </div>

          <button
            type="button"
            className="showcase-specs-toggle-btn"
            onClick={() => setSpecsOpen((prev) => !prev)}
            aria-expanded={specsOpen}
            aria-controls="routes-specs-drawer"
          >
            {specsOpen ? 'Hide Flight Clearance ▲' : 'View Flight Clearance ▼'}
          </button>

          {specsOpen && (
            <div id="routes-specs-drawer" className="showcase-drawer-panel">
              <p className="drawer-specs-title">Flight Clearance Log #404</p>
              <p>
                “Approved by Midnight Air Control. Each corridor maintains 500-foot
                separation from migrating storks and owls. Gliders equipped with silent
                feather-brakes to ensure undetectable window landings.”
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ==========================================================================
// Main Projects Section Component
// ==========================================================================
export default function ProjectsSection() {
  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <div className="section-header-block">
          <div className="storybook-chapter-folio">
            <span className="chapter-roman-numeral">CHAPTER III</span>
            <span className="chapter-folio-divider" aria-hidden="true">❖</span>
            <span className="chapter-folio-tag">Workshop Inventions & Flight</span>
          </div>
          <h2 className="section-title">Pip’s Dream Inventions</h2>
          <p className="section-description">
            Explore Pip’s three signature inventions—each designed at the Midnight Nursery
            to soothe the dark, tune bedtime peace, and ferry sweet dreams safely home.
          </p>

          <div className="storybook-floret-divider" aria-hidden="true">
            <span className="floret-line" />
            <span className="floret-glyph">✦ ❖ ✦</span>
            <span className="floret-line" />
          </div>
        </div>

        <div className="projects-showcase-stack">
          <LullabyLabShowcase />
          <NightlightCollectionShowcase />
          <DreamDeliveryRoutesShowcase />
        </div>

        {/* Story Bridge to Catch the Falling Dreams Mini-Game */}
        <div className="projects-game-invite-card">
          <div className="invite-content">
            <span className="invite-sparkle" aria-hidden="true">★</span>
            <div>
              <h3 className="invite-title">Ready for the Midnight Flight?</h3>
              <p className="invite-text">
                With your routes charted and lanterns glowing, Pip needs your steady hands.
                Help catch drifting dream stars before dawn breaks!
              </p>
            </div>
          </div>
          <a href="#catch-dreams" className="btn btn-primary invite-btn">
            <span>Play “Catch the Falling Dreams”</span>
            <span aria-hidden="true">✦</span>
          </a>
        </div>

        {/* Storybook Connector to Chapter IV */}
        <div className="storybook-chapter-transition" aria-hidden="true">
          <span className="transition-ornament">✦ · · · · · · ❖ · · · · · · ✦</span>
        </div>
      </div>
    </section>
  );
}
