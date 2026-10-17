import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-section" id="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <img
              src="/assets/pip_avatar_cloud.png"
              alt="Pip tiny avatar"
              className="footer-avatar"
              width="48"
              height="48"
              loading="lazy"
            />
            <div>
              <div className="footer-brand-name">Pip’s Dream World</div>
              <div className="footer-brand-title">
                Apprentice Dream Engineer · Station 07
              </div>
            </div>
          </div>

          <p className="footer-signoff">
            “Sleep tight, dreamer. May your skies be velvet and your stars be kind.”
          </p>

          <ul className="footer-links-row">
            <li>
              <a href="#dream-world" className="footer-link">Dream World</a>
            </li>
            <li>
              <a href="#story" className="footer-link">Story</a>
            </li>
            <li>
              <a href="#constellation-atlas" className="footer-link">Constellation Atlas</a>
            </li>
            <li>
              <a href="#projects" className="footer-link">Projects</a>
            </li>
            <li>
              <a href="#catch-dreams" className="footer-link">Catch Dreams</a>
            </li>
            <li>
              <a href="#guestbook" className="footer-link">Guestbook</a>
            </li>
          </ul>
        </div>

        {/* Quiet, Expandable Character Artwork & Credits Disclosure */}
        <details className="footer-credits-disclosure">
          <summary className="footer-credits-summary">
            <span className="disclosure-sparkle" aria-hidden="true">✦</span>
            <span>Character artwork & credits</span>
            <span className="disclosure-chevron" aria-hidden="true">▾</span>
          </summary>
          <div className="footer-credits-body">
            <p className="credits-canon-line">
              <strong>haX.baby · Baby’s First Website (Track 1: Pip the Skull Baby)</strong>
            </p>
            <p className="credits-assets-list">
              Official Creator Asset Pack · High-resolution character renders matching Pip’s bedtime nursery canon:
              {' '}<code>pip_avatar_cloud.png</code>, <code>pip_portrait.png</code>, <code>pip_dream_lantern.png</code>, <code>pip_lullaby_box.png</code>.
            </p>
            <p className="credits-license-note">
              Approved for hackathon submission. Synthesized with pure Web Audio API · Zero external dependencies.
            </p>
          </div>
        </details>

        <div className="footer-bottom-bar">
          <span>Midnight Nursery Workshop · Station #07</span>
          <span className="footer-resting-motif">✦ Quiet Dawn: Pip is dozing on Cloud #07 · All dreams safely delivered ✦</span>
          <span>React 18 + Vite · haX.baby</span>
        </div>
      </div>
    </footer>
  );
}

