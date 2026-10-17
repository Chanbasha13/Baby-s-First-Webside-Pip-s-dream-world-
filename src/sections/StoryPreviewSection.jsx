import React, { useState } from 'react';

export default function StoryPreviewSection() {
  const [prologueOpen, setPrologueOpen] = useState(false);

  return (
    <section id="story-preview" className="story-section">
      <div className="container">
        <div className="story-grid">
          {/* Left Column: Arched Editorial Frame with Official Studio Portrait */}
          <div className="story-portrait-wrap">
            <div className="story-portrait-frame">
              <img
                src="/assets/pip_portrait.png"
                alt="Pip the Skull Baby studio portrait"
                className="story-portrait-img"
                width="682"
                height="1024"
                loading="lazy"
              />
              <div className="story-portrait-caption">
                <span className="star-sparkle" aria-hidden="true">★</span>
                <span>Official Studio Portrait · Pip</span>
                <span className="star-sparkle" aria-hidden="true">★</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Dream Diary Spread */}
          <div className="story-journal-panel">
            <div className="journal-stamp-row">
              <span className="journal-log-id">Midnight Nursery Shift Log #404</span>
              <span className="journal-date">Registered 11:11 PM · Velvet Orbit</span>
            </div>

            <h2 className="story-title">The Tale of the Little Dream Engineer</h2>

            <blockquote className="story-quote-card">
              “It takes a surprisingly gentle hand to grease constellation gears
              without dropping stardust onto someone’s blanket.”
            </blockquote>

            <p className="story-body-text">
              Born under a blanket of velvet stars, Pip was appointed Junior
              Engineer at the Midnight Nursery. While the waking world sleeps, Pip
              tinkers tirelessly in the quiet nursery attic—polishing nightlights,
              calibrating music boxes, and sweeping away bad dreams with a soft starlight whisk.
            </p>

            <ul className="nursery-lore-list">
              <li className="lore-item">
                <span className="lore-bullet" aria-hidden="true">✦</span>
                <span>
                  <strong className="lore-strong">The Origin:</strong> Discovered nestled inside an antique star-chime music box on Cloud 7.
                </span>
              </li>
              <li className="lore-item">
                <span className="lore-bullet" aria-hidden="true">✦</span>
                <span>
                  <strong className="lore-strong">The Mission:</strong> Ensuring every slumbering baby and weary soul rests safe from nightmares.
                </span>
              </li>
              <li className="lore-item">
                <span className="lore-bullet" aria-hidden="true">✦</span>
                <span>
                  <strong className="lore-strong">Tool of Choice:</strong> A miniature phosphor wrench and a jar of captured firefly glimmers.
                </span>
              </li>
            </ul>

            <div className="story-teaser-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPrologueOpen((prev) => !prev)}
                aria-expanded={prologueOpen}
              >
                <span>{prologueOpen ? 'Close Nursery Log' : 'Read Nursery Log #404'}</span>
                <span aria-hidden="true">{prologueOpen ? '↑' : '↓'}</span>
              </button>

              <span className="story-future-note">
                <span aria-hidden="true">📖</span>
                <span>Full scroll story unfolds in Part 4</span>
              </span>
            </div>

            {prologueOpen && (
              <div style={{
                marginTop: 'var(--space-md)',
                padding: 'var(--space-md)',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--color-border-warm)',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: 'var(--color-text-muted)'
              }}>
                <p style={{ fontWeight: 600, color: 'var(--color-berry)', marginBottom: '6px' }}>
                  [Log Tape Transcription]
                </p>
                <p>
                  “Tonight, the Crescent Moon was three degrees too cold. I wound the bronze spring
                  two turns clockwise, sprinkled pinch #4 of powdered dream-sand, and heard the
                  first sleeping child exhale a quiet sigh. All instruments nominal. Returning to
                  lantern inspection.” — Pip
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

