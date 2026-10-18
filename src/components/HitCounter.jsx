// HitCounter.jsx – visible odometer‑style page‑view counter
import React, { useEffect, useState } from 'react';

// LocalStorage key for the counter
const STORAGE_KEY = 'pip_page_views';

export default function HitCounter() {
  const [views, setViews] = useState(0);

  useEffect(() => {
    // Initialise counter on first mount (runs once per page load)
    let count = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) count = parseInt(stored, 10) || 0;
    } catch {
      // storage unavailable – keep count at 0
    }
    const next = count + 1;
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
    setViews(next);
  }, []);

  // Render a simple odometer‑style display – monospaced digits for visual consistency
  return (
    <div className="hit-counter" aria-label={`Page views: ${views}`}>
      <span className="hit-label">Visits:</span>
      <span className="hit-value" data-value={views}>{String(views).padStart(4, '0')}</span>
    </div>
  );
}

