import React, { useState, useEffect } from 'react';
import { playGentleChime } from '../utils/chimes';
import { usePipPersonality } from '../context/PipPersonalityContext';

const STORAGE_KEY = 'pip_guestbook_entries';

const INITIAL_SEED_ENTRIES = [
  {
    id: 'seed-1',
    author: 'Little Glow Moth',
    text: 'Lantern #03 passed safety checks with flying starlight! Safe flights tonight, Pip.',
    timestamp: '10:45 PM',
  },
  {
    id: 'seed-2',
    author: 'Sleepy Dreamer #42',
    text: 'May tonight’s lullabies play in gentle 432 Hz fourths. Wishing sweet dreams to all.',
    timestamp: '11:02 PM',
  },
];

export default function GuestbookSection() {
  const { triggerGuestbookWish } = usePipPersonality();
  const [author, setAuthor] = useState('');
  const [wish, setWish] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [entries, setEntries] = useState([]);

  // Load persistent entries from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
          return;
        }
      }
      // Seed initial entries if empty
      setEntries(INITIAL_SEED_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_ENTRIES));
    } catch {
      setEntries(INITIAL_SEED_ENTRIES);
    }
  }, []);

  const handleWishSubmit = (e) => {
    e.preventDefault();
    const trimmed = wish.trim();

    if (!trimmed) {
      setErrorMsg('Please write a bedtime wish or message before sending.');
      return;
    }

    if (trimmed.length < 3) {
      setErrorMsg('Wishes should be at least 3 characters long.');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      author: author.trim() || 'Anonymous Dreamer',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Keep up to 10 latest entries
    const updated = [newEntry, ...entries].slice(0, 10);
    setEntries(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage quota or error handling
    }

    setWish('');
    setErrorMsg('');
    setSuccessMsg(`✦ Dream wish pinned to Pip's nursery log!`);
    playGentleChime(880, 0.2);
    triggerGuestbookWish(author.trim());

    setTimeout(() => {
      setSuccessMsg('');
    }, 4500);
  };

  const handleClearEntries = () => {
    setEntries([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  };

  const maxChars = 100;
  const charsRemaining = maxChars - wish.length;

  return (
    <section id="guestbook" className="guestbook-section">
      <div className="container">
        <div className="guestbook-container">
          <div className="guestbook-card" data-tilt="primary">
            <div className="guestbook-stamp">
              <div className="storybook-chapter-folio">
                <span className="chapter-roman-numeral">CHAPTER V</span>
                <span className="chapter-folio-divider" aria-hidden="true">❖</span>
                <span className="chapter-folio-tag">The Midnight Registry</span>
              </div>
            </div>

            <h2 className="guestbook-title">Leave a Star in the Dream Log</h2>
            <p className="guestbook-sub">
              Whisper a bedtime wish, sleepy lullaby prompt, or kind greeting to Pip.
              Your notes are pinned directly to the Midnight Nursery sky map.
            </p>

            <div className="storybook-floret-divider" aria-hidden="true">
              <span className="floret-line" />
              <span className="floret-glyph">✦ ❖ ✦</span>
              <span className="floret-line" />
            </div>

            {successMsg && (
              <div className="guestbook-success-banner" role="status">
                <span aria-hidden="true">★</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Local Wish Submission Form */}
            <form className="guestbook-form" onSubmit={handleWishSubmit}>
              <div className="form-row-author">
                <label htmlFor="guestbook-author" className="sr-only">
                  Your Name or Alias (optional)
                </label>
                <input
                  id="guestbook-author"
                  type="text"
                  className="guestbook-author-field"
                  placeholder="Your Name or Alias (optional)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  maxLength={30}
                />
              </div>

              <div className="form-row-wish">
                <label htmlFor="guestbook-wish" className="sr-only">
                  Bedtime dream wish
                </label>
                <textarea
                  id="guestbook-wish"
                  className="guestbook-input-field"
                  placeholder="Whisper your bedtime wish here (e.g. Wishing for smooth cloud glides tonight...)"
                  value={wish}
                  onChange={(e) => {
                    setWish(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  maxLength={maxChars}
                  aria-describedby="char-limit-note"
                  aria-invalid={Boolean(errorMsg)}
                  aria-errormessage={errorMsg ? "form-error-note" : undefined}
                  rows={3}
                />
                <div className="form-meta-row">
                  <span>Midnight Nursery registry</span>
                  <span
                    id="char-limit-note"
                    className={`char-limit-counter ${charsRemaining < 15 ? 'is-warning' : ''}`}
                  >
                    {wish.length}/{maxChars} characters
                  </span>
                </div>
              </div>

              {errorMsg && (
                <p id="form-error-note" className="form-error-msg" role="alert">
                  {errorMsg}
                </p>
              )}

              <div className="guestbook-btn-row">
                <button type="submit" className="btn btn-primary">
                  <span>Pin to Sky Map</span>
                  <span aria-hidden="true">★</span>
                </button>
              </div>
            </form>

            {/* Persistent Local Entries Log */}
            <div className="guestbook-entries-section">
              <div className="entries-section-header">
                <h3 className="entries-title">
                  <span aria-hidden="true">✦</span>
                  <span>Pinned Bedtime Log ({entries.length})</span>
                </h3>
                {entries.length > 0 && (
                  <button
                    type="button"
                    className="clear-entries-btn"
                    onClick={handleClearEntries}
                    aria-label="Clear your local guestbook wishes"
                    title="Clear your local guestbook wishes"
                  >
                    Clear my local log
                  </button>
                )}
              </div>

              {entries.length === 0 ? (
                <div className="guestbook-empty-state">
                  <p>No dream wishes logged yet. Be the first to whisper a star into Pip’s dream log tonight!</p>
                </div>
              ) : (
                <ul className="entries-list">
                  {entries.map((item) => (
                    <li key={item.id} className="entry-card entry-wish-ticket" data-tilt="secondary">
                      <div className="entry-meta-row">
                        <span className="entry-author-tag">
                          <span aria-hidden="true" className="entry-star-icon">★</span>
                          <span>{item.author}</span>
                        </span>
                        <span className="entry-stamp-badge" aria-label="Nursery delivery stamp">
                          <span className="stamp-seal" aria-hidden="true">✦</span>
                          <span className="stamp-text">DAWN GLIDER</span>
                          <span className="entry-timestamp">{item.timestamp}</span>
                        </span>
                      </div>
                      <p className="entry-text">“{item.text}”</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="guestbook-disclaimer">
              ✦ Handled with nursery care · Stored privately in this browser only · Not shared with external servers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
