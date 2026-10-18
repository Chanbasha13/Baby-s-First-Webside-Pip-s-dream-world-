import React, { useState, useEffect } from 'react';
import { isSoundEnabled, setSoundEnabled, playGentleChime, initAudio } from '../utils/chimes';
import {
  startLullaby,
  pauseLullaby,
  setLullabyVolume,
  getLullabyVolume,
  subscribeToLullaby,
} from '../utils/backgroundLullaby';

export default function Navbar() {
  // Day mode (warm cream / twilight) is the initial default experience for fresh visitors
  const [isMidnight, setIsMidnight] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      if (urlTheme === 'midnight') return true;
      if (urlTheme === 'day') return false;

      try {
        const stored = localStorage.getItem('pip_theme');
        if (stored === 'midnight') return true;
        if (stored === 'light' || stored === 'day') return false;
      } catch {
        // Storage access blocked or unavailable
      }
    }
    return false; // Initial default: Day Mode
  });

  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bedtime background music synchronization
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(() => getLullabyVolume());
  const [wakePrompt, setWakePrompt] = useState(false);
  const [volumeSliderOpen, setVolumeSliderOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToLullaby((state) => {
      setMusicPlaying(state.isPlaying);
      setMusicVolume(state.volume);
      setWakePrompt(Boolean(state.wakePrompt && !state.userHasExplicitlyPaused));
    });
    return () => unsub();
  }, []);

  // Sync theme with root dataset, meta theme-color and localStorage
  useEffect(() => {
    const theme = isMidnight ? 'midnight' : 'day';
    const color = isMidnight ? '#181222' : '#fff8f1';
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('pip_theme', theme);
    } catch {
      // Storage access blocked or quota exceeded
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }, [isMidnight]);

  // Close volume popover when clicking outside
  useEffect(() => {
    if (!volumeSliderOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.nav-volume-popover-wrap')) {
        setVolumeSliderOpen(false);
      }
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [volumeSliderOpen]);

  const toggleTheme = () => {
    setIsMidnight((prev) => {
      const next = !prev;
      playGentleChime(next ? 659.25 : 880, 0.18);
      return next;
    });
  };

  const toggleSound = async () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      await initAudio();
      playGentleChime(1046.5, 0.2);
    }
  };

  const toggleBedtimeMusic = async () => {
    if (musicPlaying) {
      pauseLullaby({ isExplicitUserAction: true });
    } else {
      await startLullaby({ isExplicitUserAction: true });
    }
  };

  const handleMusicVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setLullabyVolume(val);
  };

  const navItems = [
    { label: 'Dream World', href: '#dream-world' },
    { label: 'Story', href: '#story' },
    { label: 'Atlas', href: '#constellation-atlas' },
    { label: 'Projects', href: '#projects' },
    { label: 'Catch Dreams', href: '#catch-dreams' },
    { label: 'Guestbook', href: '#guestbook' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setVolumeSliderOpen(false);
  };

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (volumeSliderOpen) setVolumeSliderOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, volumeSliderOpen]);

  return (
    <header className="nav-header">
      <div className="container nav-container">
        {/* Brand identity on the left */}
        <a href="#dream-world" className="nav-brand" onClick={handleLinkClick}>
          <div className="nav-avatar-wrap">
            <img
              src="/assets/pip_avatar_cloud.png"
              alt="Pip tiny avatar"
              className="nav-avatar-img"
              width="44"
              height="44"
            />
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-title">Pip’s <span className="nav-brand-suffix">Dream World</span></span>
            <span className="nav-brand-sub">Midnight Nursery</span>
          </div>
        </a>

        {/* Desktop Navigation Links — evenly spaced, no text wrapping */}
        <nav className="nav-desktop-wrap" aria-label="Main Navigation">
          <ul className="nav-desktop-links">
            {navItems.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Controls: Chimes Mute, Bedtime Music, Theme Switch & Mobile Menu */}
        <div className="nav-actions">
          {/* 1. Subtle UI Interaction Chimes Toggle */}
          <button
            type="button"
            className={`nav-ctrl-btn sound-toggle-btn ${soundOn ? 'is-active' : ''}`}
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Mute interaction star chimes' : 'Enable interaction star chimes'}
            title={soundOn ? 'Star chimes: Active' : 'Star chimes: Muted'}
          >
            <span className="ctrl-icon" aria-hidden="true">
              {soundOn ? '🔔' : '🔕'}
            </span>
            <span className="ctrl-label">
              {soundOn ? 'Chimes On' : 'Muted'}
            </span>
          </button>

          {/* 2. Bedtime Music Control (Placed immediately beside Day/Night toggle) */}
          <div className="nav-music-group">
            <button
              type="button"
              className={`nav-ctrl-btn music-toggle-btn ${musicPlaying ? 'is-playing' : ''} ${wakePrompt && !musicPlaying ? 'is-wake-prompt' : ''}`}
              onClick={toggleBedtimeMusic}
              aria-pressed={musicPlaying}
              aria-label={musicPlaying ? 'Pause Bedtime Music lullaby' : wakePrompt ? 'Wake the lullaby (Play Bedtime Music)' : 'Play Bedtime Music lullaby'}
              title={musicPlaying ? 'Bedtime Music: Playing' : wakePrompt ? 'Wake the lullaby? (Play Bedtime Music)' : 'Bedtime Music: Paused'}
            >
              <span className={`ctrl-icon ${musicPlaying ? 'icon-pulse' : wakePrompt && !musicPlaying ? 'wake-sparkle' : ''}`} aria-hidden="true">
                {musicPlaying ? '❚❚' : wakePrompt ? '✨' : '▶'}
              </span>
              <span className="ctrl-label">
                {wakePrompt && !musicPlaying ? 'Wake Music' : 'Bedtime Music'}
              </span>
            </button>

            {/* Accessible volume popover control */}
            <div className="nav-volume-popover-wrap">
              <button
                type="button"
                className={`nav-vol-pop-btn ${volumeSliderOpen ? 'is-open' : ''}`}
                onClick={() => setVolumeSliderOpen((prev) => !prev)}
                aria-label={`Bedtime Music volume: ${Math.round(musicVolume * 100)}%`}
                aria-expanded={volumeSliderOpen}
                title={`Bedtime Music Volume: ${Math.round(musicVolume * 100)}%`}
              >
                <span aria-hidden="true">
                  {musicVolume === 0 ? '🔈' : musicVolume < 0.5 ? '🔉' : '🔊'}
                </span>
              </button>

              {volumeSliderOpen && (
                <div className="nav-volume-dropdown" role="dialog" aria-label="Bedtime Music volume slider">
                  <div className="nav-vol-pop-header">
                    <span className="nav-vol-pop-title">Bedtime Music</span>
                    <span className="nav-vol-pop-val">{Math.round(musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={musicVolume}
                    onChange={handleMusicVolumeChange}
                    className="nav-vol-range"
                    aria-label="Volume slider"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. Day / Midnight Theme Switcher Button */}
          <button
            type="button"
            className="nav-ctrl-btn theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isMidnight ? 'Switch to Warm Cream Day Mode' : 'Switch to Midnight Nursery Mode'}
            title={isMidnight ? 'Switch to Warm Cream Day Mode' : 'Switch to Midnight Nursery Mode'}
          >
            <span className="ctrl-icon" aria-hidden="true">
              {isMidnight ? '🌙' : '☀️'}
            </span>
            <span className="ctrl-label">
              {isMidnight ? 'Midnight' : 'Day Shift'}
            </span>
          </button>

          {/* 4. Mobile Menu Hamburger */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      <div className={`nav-mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}>
        <ul className="nav-mobile-list">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="nav-mobile-link"
                onClick={handleLinkClick}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
