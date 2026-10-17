import React, { useState, useEffect } from 'react';
import {
  startLullaby,
  pauseLullaby,
  setLullabyVolume,
  getLullabyVolume,
  subscribeToLullaby,
  attemptAutoplayOnMount,
  handleVisibilityChange,
  handlePageLifecycle,
} from '../utils/backgroundLullaby';

export default function BedtimeMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(getLullabyVolume());
  const [isExpanded, setIsExpanded] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.45);
  const [audioError, setAudioError] = useState(null);
  const [wakePrompt, setWakePrompt] = useState(false);
  const [userHasExplicitlyPaused, setUserHasExplicitlyPaused] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToLullaby((state) => {
      setIsPlaying(state.isPlaying);
      setVolume(state.volume);
      setWakePrompt(Boolean(state.wakePrompt));
      setUserHasExplicitlyPaused(Boolean(state.userHasExplicitlyPaused));
    });

    // Smart autoplay attempt on initial page mount
    attemptAutoplayOnMount();

    // Tab visibility & page lifecycle handlers
    const onVisibilityChange = () => {
      handleVisibilityChange();
    };
    const onPageHide = () => {
      handlePageLifecycle();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onPageHide);

    // Detect when footer is in viewport to adjust dock positioning / compactness
    let observer = null;
    const footerEl = document.getElementById('site-footer') || document.querySelector('.footer-section');
    if (footerEl && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          setIsNearFooter(Boolean(entry && entry.isIntersecting));
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
      );
      observer.observe(footerEl);
    }

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onPageHide);
      if (observer && footerEl) {
        observer.unobserve(footerEl);
        observer.disconnect();
      }
    };
  }, []);

  const handleTogglePlay = async () => {
    setAudioError(null);
    try {
      if (isPlaying) {
        pauseLullaby({ isExplicitUserAction: true });
      } else {
        const ok = await startLullaby({ isExplicitUserAction: true });
        if (!ok) {
          // If browser somehow blocked even user gesture, gentle note
          setWakePrompt(true);
        }
      }
    } catch {
      setWakePrompt(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setLullabyVolume(val);
    if (val > 0) {
      setPrevVolume(val);
    }
  };

  const handleToggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setLullabyVolume(0);
    } else {
      setLullabyVolume(prevVolume > 0 ? prevVolume : 0.45);
    }
  };

  const isMuted = volume === 0;
  const volumePercent = Math.round(volume * 100);

  return (
    <aside
      className={`bedtime-player-dock ${isPlaying ? 'is-playing' : 'is-paused'} ${isExpanded ? 'is-expanded' : 'is-collapsed'} ${isNearFooter ? 'near-footer' : ''} ${wakePrompt && !isPlaying ? 'has-wake-prompt' : ''}`}
      role="region"
      aria-label="Pip's Bedtime Lullaby Music Player"
    >
      <div className="bedtime-player-inner">
        {/* Main capsule row */}
        <div className="bedtime-player-main-row">
          {/* Play/Pause Button */}
          <button
            type="button"
            className={`bedtime-play-btn ${isPlaying ? 'active' : ''} ${wakePrompt && !isPlaying ? 'wake-prompt-btn' : ''}`}
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Pause Pip’s bedtime lullaby' : wakePrompt ? 'Wake the lullaby (Play)' : 'Play Pip’s bedtime lullaby'}
            aria-pressed={isPlaying}
            title={isPlaying ? 'Pause Bedtime Music' : wakePrompt ? 'Wake the lullaby (Play)' : 'Play Bedtime Music'}
          >
            {isPlaying ? (
              <svg className="player-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1.5" />
                <rect x="14" y="5" width="4" height="14" rx="1.5" />
              </svg>
            ) : (
              <svg className="player-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M8 5.14v13.72a1 1 0 001.55.83l10.7-6.86a1 1 0 000-1.66L9.55 4.31A1 1 0 008 5.14z" />
              </svg>
            )}
          </button>

          {/* Player Info & Title */}
          <div className="bedtime-player-info" onClick={() => setIsExpanded(!isExpanded)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsExpanded(!isExpanded); }} aria-expanded={isExpanded} aria-label="Toggle bedtime music controls">
            <div className="bedtime-player-header">
              <span className="bedtime-player-badge">
                <span className="bedtime-sparkle" aria-hidden="true">✨</span>
                <span className="bedtime-title-text">Bedtime Music</span>
              </span>
              {/* Sound Wave Animation */}
              <div className={`bedtime-sound-bars ${isPlaying ? 'animating' : ''}`} aria-hidden="true">
                <span className="sound-bar bar-1"></span>
                <span className="sound-bar bar-2"></span>
                <span className="sound-bar bar-3"></span>
                <span className="sound-bar bar-4"></span>
              </div>
            </div>
            <p className="bedtime-player-subtext">
              {wakePrompt && !isPlaying && !userHasExplicitlyPaused ? (
                <span className="bedtime-wake-note">Wake the lullaby? ✦</span>
              ) : audioError ? (
                <span className="bedtime-error-note">{audioError}</span>
              ) : isPlaying ? (
                'Music-Box Lullaby • Looping'
              ) : (
                'Gentle Music Box • Paused'
              )}
            </p>
          </div>

          {/* Expand / Minimize settings toggle */}
          <button
            type="button"
            className="bedtime-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse bedtime music volume controls' : 'Open bedtime music volume controls'}
            title={isExpanded ? 'Hide controls' : 'Show volume'}
          >
            <svg
              className={`expand-chevron ${isExpanded ? 'rotated' : ''}`}
              viewBox="0 0 24 24"
              width="14"
              height="14"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </div>

        {/* Collapsible Volume & Controls Tray */}
        {isExpanded && (
          <div className="bedtime-player-tray" id="bedtime-player-tray">
            <div className="bedtime-volume-row">
              <button
                type="button"
                className={`bedtime-mute-btn ${isMuted ? 'muted' : ''}`}
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Unmute lullaby music' : 'Mute lullaby music'}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .69.67 1.19 1.32.94.8-.31 1.54-.75 2.2-1.29l1.45 1.45a.996.996 0 101.41-1.41L5.05 3.63a.996.996 0 00-1.42 0zM12 4c0-.89-1.08-1.34-1.71-.71L7.71 5.88l6.29 6.29V4zm4.5 8c0-.82-.25-1.58-.67-2.21l1.5-1.5A6.974 6.974 0 0118 12c0 1.42-.42 2.74-1.15 3.84l-1.47-1.47c.39-.71.62-1.51.62-2.37z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>

              <label htmlFor="bedtime-volume-slider" className="sr-only">
                Bedtime lullaby volume
              </label>
              <input
                id="bedtime-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="bedtime-volume-slider"
                aria-label="Bedtime lullaby volume"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={volumePercent}
              />

              <span className="bedtime-vol-percent" aria-hidden="true">
                {volumePercent}%
              </span>
            </div>

            <div className="bedtime-tray-footer">
              <span className="bedtime-independent-badge">
                🎧 Independent of sound effects
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

