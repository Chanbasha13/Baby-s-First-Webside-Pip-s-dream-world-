// Navbar.jsx – enhanced with Chaos Mode, click sounds, and persistence
import React, { useState, useEffect } from 'react';
import { playGentleChime, initAudio } from '../utils/chimes';
import { isMuted, setMuted } from '../utils/mute';
import {
  startLullaby,
  pauseLullaby,
  setLullabyVolume,
  getLullabyVolume,
  subscribeToLullaby,
} from '../utils/backgroundLullaby';


export default function Navbar() {
  // Theme (Day/Midnight) initialization
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
      } catch {}
    }
    return false; // default Day mode
  });

  // UI chime toggle
  const [soundOn, setSoundOn] = useState(() => !isMuted());
  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Bedtime music state
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(() => getLullabyVolume());
  const [wakePrompt, setWakePrompt] = useState(false);
  const [volumeSliderOpen, setVolumeSliderOpen] = useState(false);
  // Chaos mode state (persisted in localStorage)
  const [isChaos, setIsChaos] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('pip_chaos_mode') === 'true';
      } catch {}
    }
    return false;
  });

  // Subscribe to lullaby background music updates
  useEffect(() => {
    const unsub = subscribeToLullaby(state => {
      setMusicPlaying(state.isPlaying);
      setMusicVolume(state.volume);
      setWakePrompt(Boolean(state.wakePrompt && !state.userHasExplicitlyPaused));
    });
    return () => unsub();
  }, []);

  // Sync theme to root element and meta tag
  useEffect(() => {
    const theme = isMidnight ? 'midnight' : 'day';
    const color = isMidnight ? '#181222' : '#fff8f1';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('pip_theme', theme); } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }, [isMidnight]);

  // Sync chaos mode class and random variables; persist flag
  useEffect(() => {
    if (isChaos) {
      document.documentElement.classList.add('chaos-mode');
      const hue = Math.floor(Math.random() * 360);
      const rotate = `${Math.floor(Math.random() * 10) - 5}deg`;
      document.documentElement.style.setProperty('--chaos-hue', hue);
      document.documentElement.style.setProperty('--chaos-rotate', rotate);
    } else {
      document.documentElement.classList.remove('chaos-mode');
      document.documentElement.style.removeProperty('--chaos-hue');
      document.documentElement.style.removeProperty('--chaos-rotate');
    }
    try { localStorage.setItem('pip_chaos_mode', isChaos); } catch {}
  }, [isChaos]);

  // Close volume popover when clicking outside
  useEffect(() => {
    if (!volumeSliderOpen) return;
    const handleClickOutside = e => {
      if (!e.target.closest('.nav-volume-popover-wrap')) setVolumeSliderOpen(false);
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [volumeSliderOpen]);

  const toggleTheme = () => {
    setIsMidnight(prev => {
      const next = !prev;
      playGentleChime(next ? 659.25 : 880, 0.18);
      return next;
    });
  };

  const toggleSound = async () => {
    const next = !soundOn;
    setSoundOn(next);
    await setMuted(!next);
    if (next) { await initAudio(); playGentleChime(1046.5, 0.2); }
  };

  const toggleChaos = () => {
    setIsChaos(prev => !prev);
    // optional audible feedback for the toggle
    playGentleChime(isChaos ? 330.0 : 523.25, 0.15);
  };

  const toggleBedtimeMusic = async () => {
    if (musicPlaying) pauseLullaby({ isExplicitUserAction: true });
    else await startLullaby({ isExplicitUserAction: true });
  };

  const handleMusicVolumeChange = e => {
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
    // play a subtle click chime for navigation interactions
    playGentleChime(880, 0.12);
  };

  // Escape key handling for mobile drawer & volume popover
  useEffect(() => {
    const handleKeyDown = e => {
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
        {/* Brand */}
        <a href="#dream-world" className="nav-brand" onClick={handleLinkClick}>
          <div className="nav-avatar-wrap">
            <img src="/assets/pip_avatar_cloud.png" alt="Pip tiny avatar" className="nav-avatar-img" width="44" height="44" />
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-title">Pip’s <span className="nav-brand-suffix">Dream World</span></span>
            <span className="nav-brand-sub">Midnight Nursery</span>
          </div>
        </a>

        {/* Desktop navigation */}
        <nav className="nav-desktop-wrap" aria-label="Main Navigation">
          <ul className="nav-desktop-links">
            {navItems.map(item => (
              <li key={item.label}>
                <a href={item.href} className="nav-link" onClick={handleLinkClick}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action controls */}
        <div className="nav-actions">
          {/* Chime toggle */}
          <button type="button" className={`nav-ctrl-btn sound-toggle-btn ${soundOn ? 'is-active' : ''}`} onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? 'Mute interaction star chimes' : 'Enable interaction star chimes'} title={soundOn ? 'Star chimes: Active' : 'Star chimes: Muted'}>
            <span className="ctrl-icon" aria-hidden="true">{soundOn ? '🔔' : '🔕'}</span>
            <span className="ctrl-label">{soundOn ? 'Chimes On' : 'Muted'}</span>
          </button>

          {/* Bedtime music */}
          <div className="nav-music-group">
            <button type="button" className={`nav-ctrl-btn music-toggle-btn ${musicPlaying ? 'is-playing' : ''} ${wakePrompt && !musicPlaying ? 'is-wake-prompt' : ''}`} onClick={toggleBedtimeMusic} aria-pressed={musicPlaying} aria-label={musicPlaying ? 'Pause Bedtime Music lullaby' : wakePrompt ? 'Wake the lullaby (Play Bedtime Music)' : 'Play Bedtime Music lullaby'} title={musicPlaying ? 'Bedtime Music: Playing' : wakePrompt ? 'Wake the lullaby? (Play Bedtime Music)' : 'Bedtime Music: Paused'}>
              <span className={`ctrl-icon ${musicPlaying ? 'icon-pulse' : wakePrompt && !musicPlaying ? 'wake-sparkle' : ''}`} aria-hidden="true">{musicPlaying ? '❚❚' : wakePrompt ? '✨' : '▶'}</span>
              <span className="ctrl-label">{wakePrompt && !musicPlaying ? 'Wake Music' : 'Bedtime Music'}</span>
            </button>
            {/* Volume popover */}
            <div className="nav-volume-popover-wrap">
              <button type="button" className={`nav-vol-pop-btn ${volumeSliderOpen ? 'is-open' : ''}`} onClick={() => setVolumeSliderOpen(v => !v)} aria-label={`Bedtime Music volume: ${Math.round(musicVolume * 100)}%`} aria-expanded={volumeSliderOpen} title={`Bedtime Music Volume: ${Math.round(musicVolume * 100)}%`}>
                <span aria-hidden="true">{musicVolume === 0 ? '🔈' : musicVolume < 0.5 ? '🔉' : '🔊'}</span>
              </button>
              {volumeSliderOpen && (
                <div className="nav-volume-dropdown" role="dialog" aria-label="Bedtime Music volume slider">
                  <div className="nav-vol-pop-header">
                    <span className="nav-vol-pop-title">Bedtime Music</span>
                    <span className="nav-vol-pop-val">{Math.round(musicVolume * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.02" value={musicVolume} onChange={handleMusicVolumeChange} className="nav-vol-range" aria-label="Volume slider" />
                </div>
              )}
            </div>
          </div>

          {/* Theme toggle */}
          <button type="button" className="nav-ctrl-btn theme-toggle-btn" onClick={toggleTheme} aria-label={isMidnight ? 'Switch to Warm Cream Day Mode' : 'Switch to Midnight Nursery Mode'} title={isMidnight ? 'Switch to Warm Cream Day Mode' : 'Switch to Midnight Nursery Mode'}>
            <span className="ctrl-icon" aria-hidden="true">{isMidnight ? '🌙' : '☀️'}</span>
            <span className="ctrl-label">{isMidnight ? 'Midnight' : 'Day Shift'}</span>
          </button>

          {/* Chaos mode toggle */}
          <button type="button" className="nav-ctrl-btn chaos-toggle-btn" onClick={toggleChaos} aria-pressed={isChaos} aria-label={isChaos ? 'Disable Chaos Mode' : 'Enable Chaos Mode'} title={isChaos ? 'Chaos Mode: On (click to disable)' : 'Chaos Mode: Off (click to enable)'}>
            <span className="ctrl-icon" aria-hidden="true">{isChaos ? '🌀' : '⚪'}</span>
            <span className="ctrl-label">Chaos</span>
          </button>

          {/* Mobile menu */}
          <button type="button" className="mobile-menu-btn" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpen}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Mobile drawer */}
      <div className={`nav-mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}>
        <ul className="nav-mobile-list">
          {navItems.map(item => (
            <li key={item.label}>
              <a href={item.href} className="nav-mobile-link" onClick={handleLinkClick}>{item.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
