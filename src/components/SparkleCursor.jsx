import React, { useEffect, useRef } from 'react';

/**
 * SparkleCursor
 * Lightweight, zero-rerender pointer sprinkle trail for desktop.
 * - Auto-pauses RAF loop when idle (0% CPU when not moving)
 * - Mix of celestial 4-point stars, soft stardust dots, and 8-point twinkles
 * - Ignores touch devices and respects prefers-reduced-motion
 * - Non-blocking pointer events (pointer-events: none, z-index: 9999)
 */
export default function SparkleCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check for reduced motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Check for pointer capability (must have fine hover pointer, not touch)
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reducedMotion || !hasHover) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    let rafId = null;
    let lastX = 0;
    let lastY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Theme-adaptive celestial palette matching Pip's dream world
    const MIDNIGHT_COLORS = [
      '#ffd166', // Luminous star gold
      '#f4b248', // Warm amber
      '#ffffff', // Brilliant white glint
      '#9cd0f0', // Celestial moonbeam blue
      '#e88eb0', // Gentle nursery berry pink
      '#ffe08a', // Soft starlight cream
    ];

    const DAY_COLORS = [
      '#a34063', // Signature nursery berry
      '#d48817', // Rich warm honey gold
      '#3f779c', // Celestial twilight sky blue
      '#e0952a', // Radiant amber star
      '#782d49', // Velvet plum sparkle
      '#bf5a82', // Dusty rose twinkle
    ];

    const createParticle = (x, y) => {
      const isMidnight = document.documentElement.getAttribute('data-theme') === 'midnight';
      const palette = isMidnight ? MIDNIGHT_COLORS : DAY_COLORS;

      // Choose particle type: star (35%), dot (30%), diamond (20%), twinkle (15%)
      const rand = Math.random();
      const type = rand < 0.35 ? 'star' : rand < 0.65 ? 'dot' : rand < 0.85 ? 'diamond' : 'twinkle';
      const color = palette[Math.floor(Math.random() * palette.length)];
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.8 + 0.2;
      const baseSize = type === 'dot'
        ? Math.random() * 1.6 + 1.2
        : type === 'star'
        ? Math.random() * 2.4 + 2.0
        : type === 'diamond'
        ? Math.random() * 2.2 + 1.8
        : Math.random() * 2.8 + 2.8;

      particles.push({
        type,
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.28, // Gentle upward celestial drift
        size: baseSize,
        color,
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.022 + 0.015, // Smooth 45-65 frame lifespan
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        twinklePhase: Math.random() * Math.PI,
      });
    };

    // Draw multi-pointed celestial star
    const drawStar = (cx, cy, spikes, outerRadius, innerRadius, color, alpha, rot) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = color;

      let rotAngle = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(0, 0 - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rotAngle) * outerRadius;
        y = Math.sin(rotAngle) * outerRadius;
        ctx.lineTo(x, y);
        rotAngle += step;

        x = Math.cos(rotAngle) * innerRadius;
        y = Math.sin(rotAngle) * innerRadius;
        ctx.lineTo(x, y);
        rotAngle += step;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw elongated celestial diamond crystal glint
    const drawDiamond = (cx, cy, width, height, color, alpha, rot) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -height);
      ctx.lineTo(width, 0);
      ctx.lineTo(0, height);
      ctx.lineTo(-width, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw soft glowing stardust dot
    const drawDot = (cx, cy, radius, color, alpha) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha * 0.85);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.alpha = Math.max(0, p.life * p.life); // Smooth quadratic fade
        p.size *= 0.985; // Subtle organic shrink
        p.rotation += p.rotSpeed;
        p.twinklePhase += 0.12;

        if (p.life <= 0 || p.size <= 0.4) {
          particles.splice(i, 1);
          continue;
        }

        // Render based on particle type
        if (p.type === 'dot') {
          drawDot(p.x, p.y, p.size, p.color, p.alpha);
        } else if (p.type === 'star') {
          drawStar(p.x, p.y, 4, p.size, p.size * 0.38, p.color, p.alpha, p.rotation);
        } else if (p.type === 'diamond') {
          drawDiamond(p.x, p.y, p.size * 0.6, p.size * 1.4, p.color, p.alpha, p.rotation);
        } else if (p.type === 'twinkle') {
          const twinkleAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.twinklePhase));
          drawStar(p.x, p.y, 8, p.size, p.size * 0.28, p.color, twinkleAlpha, p.rotation);
        }
      }

      // Continue animation only while particles are alive; auto-pauses when idle
      if (particles.length > 0) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    };

    const handlePointerMove = (e) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Smooth throttle: trigger when cursor moves at least 10px
      if (dist > 10) {
        lastX = e.clientX;
        lastY = e.clientY;

        // Strict limit to keep trail lightweight and 60fps smooth
        if (particles.length < 46) {
          createParticle(e.clientX, e.clientY);
          // 40% chance of a twin companion glint for richer magical feeling
          if (Math.random() > 0.60 && particles.length < 44) {
            createParticle(e.clientX, e.clientY);
          }
        }

        if (!rafId) {
          rafId = requestAnimationFrame(render);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        particles = [];
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999, // Floating above backdrop but non-blocking (pointerEvents: none)
      }}
      aria-hidden="true"
    />
  );
}
