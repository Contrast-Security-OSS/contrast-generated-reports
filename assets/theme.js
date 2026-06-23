/* ============================================================
   Contrast Security Reports — Shared Interactions
   v2.0 (June 2026) — counters, scroll reveal, meters
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Animated number counters ---- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    if (reduceMotion || isNaN(target)) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    const dur = 1100;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  /* ---- IntersectionObserver: reveal + counters + meters ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.classList.contains('reveal')) el.classList.add('in');
      if (el.hasAttribute('data-count')) animateCount(el);
      if (el.classList.contains('meter')) {
        const fill = el.querySelector('span');
        if (fill && fill.dataset.fill) fill.style.width = fill.dataset.fill + '%';
      }
      io.unobserve(el);
    });
  }, { threshold: 0.2 });

  function observeAll() {
    document.querySelectorAll('.reveal, [data-count], .meter').forEach((el) => io.observe(el));
  }

  /* ---- Stagger reveal delays ---- */
  function staggerReveals() {
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        child.classList.add('reveal');
        child.style.transitionDelay = (i * 70) + 'ms';
      });
    });
  }

  /* ---- Expandable / accordion ---- */
  function initAccordions() {
    document.querySelectorAll('[data-toggle]').forEach((header) => {
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      const fire = () => header.closest('[data-accordion]').classList.toggle('open');
      header.addEventListener('click', fire);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    staggerReveals();
    observeAll();
    initAccordions();
  });

  window.ContrastUI = { animateCount, observeAll };
})();
