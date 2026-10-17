import React from 'react';
import CelestialDreamEnvironment from '../components/CelestialDreamEnvironment';
import { usePipPersonality, PIP_STATES } from '../context/PipPersonalityContext';

export default function HeroSection() {
  const { personalityState, currentMessage, messageVisible, wakePip } = usePipPersonality();

  return (
    <section id="dream-world" className="hero-section">
      {/* Immersive 3D Layered Celestial Environment Backdrop */}
      <CelestialDreamEnvironment />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-grid">
          {/* Left Column: Story & Introduction */}
          <div className="hero-content">
            <div className="hero-kicker-row">
              <span className="badge badge-berry">Midnight Nursery #07</span>
              <span className="hero-role-tag">Apprentice Dream Engineer · Station 07</span>
            </div>

            <h1 className="hero-heading">
              Where gentle dreams are <span className="highlight-berry">woven, tuned</span> & safely sent.
            </h1>

            <p className="hero-lead">
              Hello, dreamer. Pip works the quiet midnight shift at the Nursery
              workshop—tinkering with star-chime music boxes, testing crescent
              lanterns for comforting shadows, and charting safe cloud routes across
              the velvet sky.
            </p>

            <div className="hero-cta-group">
              <a href="#projects" className="btn btn-primary">
                <span>Explore the Dream World</span>
                <span aria-hidden="true">✦</span>
              </a>
              <a href="#story" className="btn btn-secondary">
                <span>Meet Pip</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>

            {/* Early-Web Dream Registry Specs */}
            <div className="hero-quick-specs" data-tilt="secondary">
              <div className="spec-item">
                <span className="spec-label">Night Station</span>
                <span className="spec-value">Midnight Nursery #07</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Shift Hours</span>
                <span className="spec-value">9:00 PM — Dawn</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Dream Frequency</span>
                <span className="spec-value">432 Hz Star Chime</span>
              </div>
            </div>
          </div>

          {/* Right Column: Character Composition with Layered Visuals */}
          <div className="hero-visual">
            <div className="hero-visual-frame">
              {/* Soft Ambient Celestial Halo behind Pip */}
              <div className={`pip-celestial-halo state-${personalityState}`} aria-hidden="true" />

              {/* Pip's Living Thought/Whisper Bubble */}
              <div
                className={`pip-thought-bubble state-${personalityState} ${messageVisible ? 'is-visible' : ''}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="bubble-sparkle" aria-hidden="true">
                  {personalityState === PIP_STATES.DREAMING
                    ? '💤'
                    : personalityState === PIP_STATES.HAPPY
                    ? '🎉'
                    : personalityState === PIP_STATES.PROUD
                    ? '🌟'
                    : personalityState === PIP_STATES.CURIOUS
                    ? '✨'
                    : '✦'}
                </span>
                <span className="bubble-text">{currentMessage || 'Shhh… Pip dozed off mid-calibration.'}</span>
                <span className="bubble-tail" aria-hidden="true" />
              </div>

              {/* Arched Storybook Portal Frame */}
              <div className="pip-storybook-portal">
                <div
                  className={`pip-character-float-wrap state-${personalityState}`}
                  onClick={wakePip}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && wakePip()}
                  aria-label="Pip the Apprentice Dream Engineer. Tap to say hello."
                  title="Pip the Apprentice Dream Engineer · Tap to say hello"
                >
                  <img
                    src="/assets/pip_avatar_cloud.png"
                    alt="Pip the Junior Dream Engineer floating gently on a cozy dream cloud and waving"
                    className="hero-character-img"
                    width="896"
                    height="1090"
                  />
                </div>
              </div>

              <div className={`floating-dream-badge state-${personalityState}`}>
                <span className="star-sparkle" aria-hidden="true">
                  {personalityState === PIP_STATES.DREAMING
                    ? '💤'
                    : personalityState === PIP_STATES.HAPPY
                    ? '🎉'
                    : personalityState === PIP_STATES.PROUD
                    ? '🌟'
                    : personalityState === PIP_STATES.CURIOUS
                    ? '✨'
                    : '✦'}
                </span>
                <span>
                  {personalityState === PIP_STATES.DREAMING
                    ? 'Pip is dreaming · Midnight Nursery'
                    : personalityState === PIP_STATES.HAPPY
                    ? 'Pip is happy · Dreams caught!'
                    : personalityState === PIP_STATES.CURIOUS
                    ? 'Pip is curious · Tuning starlight'
                    : personalityState === PIP_STATES.PROUD
                    ? 'Pip is proud · Dream registered'
                    : 'Pip the Skull Baby · Junior Dream Engineer'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
