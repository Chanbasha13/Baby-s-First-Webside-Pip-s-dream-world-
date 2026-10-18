import React, { useState, useEffect, useRef } from 'react';
import { usePipPersonality } from '../context/PipPersonalityContext';
import { QUEST_CLUES, QUEST_CLUE_IDS, SECRET_LETTER } from '../data/questData';

/**
 * Interactive clue button placed seamlessly inside sections.
 * Accessible with mouse, touch, and keyboard (Space/Enter).
 */
export function SecretClueButton({ clueId, className = '' }) {
  const { questClues, recordQuestClue, setActiveQuestModal } = usePipPersonality();
  const clue = QUEST_CLUES[clueId];
  if (!clue) return null;

  const isDiscovered = questClues.includes(clueId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    recordQuestClue(clueId);
    setActiveQuestModal({ type: 'clue', clueId });
  };

  return (
    <button
      type="button"
      className={`secret-clue-btn ${className} ${isDiscovered ? 'is-discovered' : ''}`}
      onClick={handleClick}
      aria-label={`${clue.title}: ${clue.clueName} (${isDiscovered ? 'Discovered — click to re-read story fragment' : 'Hidden Dream Token — click to inspect'})`}
      title={`${clue.clueName} (${isDiscovered ? 'Found' : 'Undiscovered'})`}
    >
      <span aria-hidden="true">{clue.glyph}</span>
      {isDiscovered && (
        <span className="clue-discovered-badge" aria-hidden="true">✓</span>
      )}
    </button>
  );
}

/**
 * Main Secret Dream Quest component:
 * - Floating progress dock (bottom-left)
 * - Expandable drawer for review
 * - Clue story fragment modal
 * - Pip's Secret Letter modal with replay/reset option
 */
export default function SecretDreamQuest() {
  const {
    questClues,
    activeQuestModal,
    setActiveQuestModal,
    resetQuest,
  } = usePipPersonality();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const modalContainerRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  const foundCount = questClues.length;
  const isAllFound = foundCount === QUEST_CLUE_IDS.length;

  // Handle ESC key and focus management for modals and drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showResetConfirm) {
          setShowResetConfirm(false);
        } else if (activeQuestModal) {
          setActiveQuestModal(null);
        } else if (isDrawerOpen) {
          setIsDrawerOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestModal, isDrawerOpen, showResetConfirm, setActiveQuestModal]);

  // Focus trap / auto-focus when modal opens
  useEffect(() => {
    if (activeQuestModal) {
      previousActiveElementRef.current = document.activeElement;
      const timer = setTimeout(() => {
        if (modalContainerRef.current) {
          modalContainerRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else if (previousActiveElementRef.current) {
      try {
        previousActiveElementRef.current.focus();
      } catch {
        // Element may no longer exist
      }
      previousActiveElementRef.current = null;
    }
  }, [activeQuestModal]);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const openClueModal = (clueId) => {
    setActiveQuestModal({ type: 'clue', clueId });
    setIsDrawerOpen(false);
  };

  const openLetterModal = () => {
    if (!isAllFound) return;
    setActiveQuestModal({ type: 'letter' });
    setIsDrawerOpen(false);
  };

  const handleResetQuest = () => {
    resetQuest();
    setShowResetConfirm(false);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Floating Secret Dream Quest Progress Indicator Dock */}
      <div className="dream-quest-dock" aria-label="Secret Dream Quest Tracker">
        {/* Expanded Drawer Panel */}
        {isDrawerOpen && (
          <div
            className="quest-drawer-panel"
            role="region"
            aria-label="Secret Dream Quest Details"
          >
            <div className="quest-drawer-header">
              <div className="quest-drawer-title-wrap">
                <span className="quest-drawer-glyph" aria-hidden="true">✦</span>
                <span className="quest-drawer-title">Pip’s Dream Quest</span>
              </div>
              <button
                type="button"
                className="quest-drawer-close-btn"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close quest drawer"
              >
                ✕
              </button>
            </div>

            <p className="quest-drawer-desc">
              Three celestial tokens are hidden across Pip’s world. Discover them
              to uncover Pip’s apprentice engineer notes and unseal the Secret Letter.
            </p>

            <ul className="quest-clues-list">
              {QUEST_CLUE_IDS.map((id) => {
                const clue = QUEST_CLUES[id];
                const isFound = questClues.includes(id);
                return (
                  <li
                    key={id}
                    className={`quest-clue-item ${isFound ? 'is-discovered' : ''}`}
                  >
                    <div className="quest-clue-info">
                      <div className="quest-clue-glyph-box" aria-hidden="true">
                        {clue.glyph}
                      </div>
                      <div className="quest-clue-text">
                        <span className="quest-clue-name">
                          {clue.clueName} {isFound ? '✓' : ''}
                        </span>
                        <span className="quest-clue-location">
                          {isFound ? clue.locationName : clue.locationHint}
                        </span>
                      </div>
                    </div>
                    {isFound ? (
                      <button
                        type="button"
                        className="quest-clue-action-btn"
                        onClick={() => openClueModal(id)}
                        aria-label={`Read ${clue.clueName} field notes`}
                      >
                        Read Notes
                      </button>
                    ) : (
                      <span className="quest-clue-location" style={{ fontStyle: 'italic' }}>
                        Hidden ○
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="quest-drawer-actions">
              {isAllFound ? (
                <div className="quest-letter-unlocked-banner">
                  <span className="quest-unlocked-title">✉️ Secret Letter Unsealed!</span>
                  <button
                    type="button"
                    className="btn-open-secret-letter"
                    onClick={openLetterModal}
                  >
                    <span>Read Pip’s Letter</span>
                    <span aria-hidden="true">➔</span>
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {foundCount} of {QUEST_CLUE_IDS.length} tokens gathered
                </div>
              )}

              {foundCount > 0 && (
                showResetConfirm ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', padding: '6px' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--color-text-main)' }}>
                      Reset clues so you can find them again?
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '3px 10px', fontSize: '0.74rem' }}
                        onClick={handleResetQuest}
                      >
                        Yes, Reset
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '3px 10px', fontSize: '0.74rem' }}
                        onClick={() => setShowResetConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="quest-reset-link-btn"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    ↺ Reset Quest Progress
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Floating Pill Toggle Button */}
        <button
          type="button"
          className={`quest-pill-btn ${isAllFound ? 'is-all-found' : ''}`}
          onClick={isAllFound && !isDrawerOpen ? openLetterModal : toggleDrawer}
          aria-expanded={isDrawerOpen}
          aria-label={
            isAllFound
              ? 'Pip’s Secret Letter is unsealed! Click to read Pip’s Letter'
              : `Secret Dream Quest progress: ${foundCount} of 3 clues discovered. Click to view quest log.`
          }
        >
          <span className="quest-pill-icon" aria-hidden="true">
            {isAllFound ? '✉️' : '✦'}
          </span>
          <span className="quest-pill-label">
            {isAllFound ? 'Secret Letter' : 'Dream Quest'}
          </span>
          <span className="quest-pill-badge">
            {foundCount}/{QUEST_CLUE_IDS.length}
          </span>
          <span className="quest-pill-tokens" aria-hidden="true">
            {QUEST_CLUE_IDS.map((id) => (
              <span
                key={id}
                className={`quest-token-dot ${questClues.includes(id) ? 'is-active' : ''}`}
              >
                ●
              </span>
            ))}
          </span>
        </button>
      </div>

      {/* Story Fragment Modal */}
      {activeQuestModal && activeQuestModal.type === 'clue' && (
        <div
          className="quest-modal-backdrop"
          onClick={() => setActiveQuestModal(null)}
          role="presentation"
        >
          <div
            className="quest-modal-container"
            ref={modalContainerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quest-fragment-title"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const clue = QUEST_CLUES[activeQuestModal.clueId];
              if (!clue) return null;
              return (
                <div className="quest-fragment-card">
                  <button
                    type="button"
                    className="quest-modal-close-icon"
                    onClick={() => setActiveQuestModal(null)}
                    aria-label="Close story fragment modal"
                  >
                    ✕
                  </button>

                  <div className="quest-fragment-header">
                    <div className="quest-fragment-icon-frame" aria-hidden="true">
                      {clue.glyph}
                    </div>
                    <div className="quest-fragment-titles">
                      <span className="quest-fragment-kicker">{clue.locationName}</span>
                      <h3 id="quest-fragment-title" className="quest-fragment-title">
                        {clue.clueName}
                      </h3>
                    </div>
                  </div>

                  <blockquote className="quest-fragment-quote-box">
                    {clue.storyFragment}
                  </blockquote>

                  <div className="quest-fragment-log-pill">
                    <span aria-hidden="true">📋</span>
                    <span>{clue.logEntry}</span>
                  </div>

                  <div className="quest-fragment-progress-row">
                    <span className="quest-fragment-progress-text">
                      Dream Tokens: <strong>{foundCount} of {QUEST_CLUE_IDS.length}</strong>
                    </span>

                    {isAllFound ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.84rem' }}
                        onClick={openLetterModal}
                      >
                        <span>Open Secret Letter</span>
                        <span aria-hidden="true">✉️</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.84rem' }}
                        onClick={() => setActiveQuestModal(null)}
                      >
                        Keep Exploring
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Pip's Secret Letter Modal */}
      {activeQuestModal && activeQuestModal.type === 'letter' && isAllFound && (
        <div
          className="quest-modal-backdrop"
          onClick={() => setActiveQuestModal(null)}
          role="presentation"
        >
          <div
            className="quest-modal-container"
            ref={modalContainerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quest-letter-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quest-letter-card">
              <button
                type="button"
                className="quest-modal-close-icon"
                onClick={() => setActiveQuestModal(null)}
                aria-label="Close Secret Letter modal"
              >
                ✕
              </button>

              <div className="letter-wax-seal-badge" aria-hidden="true">
                <span>✦</span>
                <span>{SECRET_LETTER.waxSealText}</span>
                <span>✦</span>
              </div>

              <div className="letter-header-block">
                <span className="letter-shift-label">{SECRET_LETTER.shiftLabel}</span>
                <h3 id="quest-letter-title" className="letter-title">
                  {SECRET_LETTER.title}
                </h3>
              </div>

              <div className="letter-body">
                <p className="letter-greeting">{SECRET_LETTER.greeting}</p>
                {SECRET_LETTER.paragraphs.map((p, idx) => (
                  <p key={idx} className="letter-paragraph">
                    {p}
                  </p>
                ))}

                <div className="letter-signoff-block">
                  <span className="letter-signoff">{SECRET_LETTER.signoff}</span>
                  <span className="letter-signature">{SECRET_LETTER.signature}</span>
                  <span className="letter-signature-title">
                    {SECRET_LETTER.signatureTitle}
                  </span>
                </div>
              </div>

              <div className="letter-footer-actions">
                {showResetConfirm ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-main)' }}>
                      Replay quest from beginning?
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                      onClick={handleResetQuest}
                    >
                      Yes, Replay
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                      onClick={() => setShowResetConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="quest-reset-link-btn"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    ↺ Replay Secret Quest
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 16px', fontSize: '0.84rem' }}
                  onClick={() => setActiveQuestModal(null)}
                >
                  Close Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

