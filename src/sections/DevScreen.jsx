import React from 'react';
import AssetPreviewCard from '../components/AssetPreviewCard';

const OFFICIAL_ASSETS = [
  {
    title: 'Pip Avatar Cloud',
    filename: 'pip_avatar_cloud.png',
    tag: 'Cloud Float',
    description: "Pip floating on a cozy dream cloud waving a tiny hand.",
  },
  {
    title: 'Character Portrait',
    filename: 'pip_portrait.png',
    tag: 'Official Studio',
    description: "Official high-resolution character studio portrait of Pip.",
  },
  {
    title: 'Dream Lantern',
    filename: 'pip_dream_lantern.png',
    tag: 'Nightlight',
    description: "Pip's glowing crescent moon nightlight lantern.",
  },
  {
    title: 'Lullaby Lab Box',
    filename: 'pip_lullaby_box.png',
    tag: 'Music Box',
    description: "The Lullaby Lab music box with golden winding key and star chimes.",
  },
];

export default function DevScreen() {
  return (
    <div className="dev-screen-wrapper">
      <header className="dev-header">
        <div className="dev-banner">
          <span className="badge-berry">haX.baby · Track 1 Foundation</span>
          <span className="dev-status-pill">● Dev Screen Active</span>
        </div>
        
        <h1 className="dev-title">Pip’s Dream World</h1>
        <p className="dev-subtitle">
          React + Vite development foundation initialized with official creator assets,
          warm editorial typography, and haX design tokens.
        </p>

        <div className="dev-tokens-strip">
          <div className="token-swatch swatch-cream">
            <span className="swatch-label">Warm Cream</span>
            <code>#fff8f1</code>
          </div>
          <div className="token-swatch swatch-berry">
            <span className="swatch-label">Berry</span>
            <code>#a34063</code>
          </div>
          <div className="token-swatch swatch-brown">
            <span className="swatch-label">Warm Brown</span>
            <code>#3d271d</code>
          </div>
          <div className="token-swatch swatch-gold">
            <span className="swatch-label">Star Gold</span>
            <code>#f4b248</code>
          </div>
        </div>
      </header>

      <main className="dev-content">
        <div className="section-heading-row">
          <h2 className="section-title">Verified Official Asset Pack</h2>
          <span className="assets-count">4 canonical studio renders (PNG + JPG)</span>
        </div>

        <div className="assets-grid">
          {OFFICIAL_ASSETS.map((asset) => (
            <AssetPreviewCard
              key={asset.filename}
              title={asset.title}
              filename={asset.filename}
              tag={asset.tag}
              description={asset.description}
            />
          ))}
        </div>
      </main>

      <footer className="dev-footer">
        <p>
          Ready for <strong>Part 2</strong>: UI Layout, Sections & Interactive Experience.
        </p>
      </footer>
    </div>
  );
}

