/**
 * Pip's Dream World — Storybook 3D Hover & Directional Lighting Controller
 *
 * Lightweight, zero-dependency, zero-rerender perspective tilt.
 * - Restrained 1.8°–3.0° rotation with smooth cubic-bezier return
 * - Moving directional starlight highlight / glare
 * - Automatic pause/reset on pointerleave or tab hide
 * - Fully disabled for prefers-reduced-motion and touch devices
 * - Event delegation: 0% overhead when not hovering cards
 */

export function initStorybookTilt() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  // Check for fine hover pointer capability and reduced motion
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!hasFinePointer || prefersReduced) {
    return () => {};
  }

  let activeCard = null;
  let activeRect = null;
  let isSecondary = false;
  let rafId = null;
  let pendingX = 0;
  let pendingY = 0;

  const resetCard = (card) => {
    if (!card) return;
    card.style.setProperty('--tilt-rx', '0deg');
    card.style.setProperty('--tilt-ry', '0deg');
    card.style.setProperty('--tilt-lift', '0px');
    card.style.setProperty('--glare-opacity', '0');
  };

  const updateCardTransform = () => {
    if (!activeCard || !activeRect) {
      rafId = null;
      return;
    }

    const { left, top, width, height } = activeRect;
    if (width <= 0 || height <= 0) {
      rafId = null;
      return;
    }

    const relX = pendingX - left;
    const relY = pendingY - top;

    // Normalized from -1 to 1
    const normX = Math.max(-1, Math.min(1, (relX / width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, (relY / height) * 2 - 1));

    // Percentage for highlight position
    const percentX = Math.max(0, Math.min(100, (relX / width) * 100)).toFixed(1);
    const percentY = Math.max(0, Math.min(100, (relY / height) * 100)).toFixed(1);

    // Tasteful restrained range: 1.0° for primary, 0.7° for secondary
    // Lift is strictly 0px so cards remain stationary and never jump or fight cursor hit areas
    const maxRot = isSecondary ? 0.7 : 1.0;
    const lift = '0px';
    const rotX = (-normY * maxRot).toFixed(2);
    const rotY = (normX * maxRot).toFixed(2);

    activeCard.style.setProperty('--tilt-rx', `${rotX}deg`);
    activeCard.style.setProperty('--tilt-ry', `${rotY}deg`);
    activeCard.style.setProperty('--tilt-lift', lift);
    activeCard.style.setProperty('--glare-x', `${percentX}%`);
    activeCard.style.setProperty('--glare-y', `${percentY}%`);
    activeCard.style.setProperty('--glare-opacity', '1');

    rafId = null;
  };

  const isInteractiveTarget = (target) => {
    return !!target?.closest('button, a, input, textarea, select, .secret-clue-btn, .map-waypoint-btn, [role="button"], [tabindex="0"]');
  };

  const onPointerOver = (e) => {
    const card = e.target.closest('[data-tilt], .storybook-tilt-card');
    if (!card) return;

    if (activeCard && activeCard !== card) {
      resetCard(activeCard);
    }

    activeCard = card;
    activeRect = card.getBoundingClientRect();
    isSecondary = card.getAttribute('data-tilt') === 'secondary' || card.classList.contains('tilt-secondary');

    if (isInteractiveTarget(e.target)) {
      resetCard(activeCard);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      return;
    }

    pendingX = e.clientX;
    pendingY = e.clientY;

    if (!rafId) {
      rafId = requestAnimationFrame(updateCardTransform);
    }
  };

  const onPointerMove = (e) => {
    if (!activeCard) {
      // Find card if moving into one
      const card = e.target.closest('[data-tilt], .storybook-tilt-card');
      if (card) {
        activeCard = card;
        activeRect = card.getBoundingClientRect();
        isSecondary = card.getAttribute('data-tilt') === 'secondary' || card.classList.contains('tilt-secondary');
      } else {
        return;
      }
    }

    if (isInteractiveTarget(e.target)) {
      resetCard(activeCard);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      return;
    }

    pendingX = e.clientX;
    pendingY = e.clientY;

    if (!rafId) {
      rafId = requestAnimationFrame(updateCardTransform);
    }
  };

  const onPointerOut = (e) => {
    if (!activeCard) return;

    // Check if moving to an element outside the active card
    const related = e.relatedTarget;
    if (!related || !activeCard.contains(related)) {
      resetCard(activeCard);
      activeCard = null;
      activeRect = null;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  };

  const onVisibilityChange = () => {
    if (document.hidden && activeCard) {
      resetCard(activeCard);
      activeCard = null;
      activeRect = null;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  };

  document.addEventListener('pointerover', onPointerOver, { passive: true });
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerout', onPointerOut, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    if (activeCard) resetCard(activeCard);
    if (rafId) cancelAnimationFrame(rafId);
    document.removeEventListener('pointerover', onPointerOver);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerout', onPointerOut);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

