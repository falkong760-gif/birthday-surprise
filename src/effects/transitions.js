import gsap from 'gsap';

/**
 * Fade out scene element
 */
export function fadeOutScene(el, duration = 0.4) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dur = prefersReducedMotion ? duration * 0.5 : duration;

  return gsap.to(el, {
    opacity: 0,
    duration: dur,
    ease: 'power2.inOut',
  });
}

/**
 * Fade in scene element
 */
export function fadeInScene(el, duration = 0.4) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dur = prefersReducedMotion ? duration * 0.5 : duration;

  return gsap.fromTo(
    el,
    { opacity: 0 },
    { opacity: 1, duration: dur, ease: 'power2.inOut' }
  );
}

/**
 * Cinematic fade through black transition helper
 * @param {HTMLElement} overlayEl - Black overlay element
 * @param {HTMLElement} contentEl - Active scene content wrapper
 * @param {Function} onMidpoint - Callback when screen is fully black (to swap scenes)
 * @param {number} duration - Total duration of transition
 */
export function fadeThroughBlack(overlayEl, contentEl, onMidpoint, duration = 0.8) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const halfDur = (prefersReducedMotion ? duration * 0.5 : duration) / 2;

  const tl = gsap.timeline();

  // Step 1: Scale slightly, apply blur, fade overlay to 1
  if (contentEl && !prefersReducedMotion) {
    tl.to(contentEl, { scale: 0.98, filter: 'blur(4px)', duration: halfDur, ease: 'power2.in' }, 0);
  }

  if (overlayEl) {
    tl.to(overlayEl, { opacity: 1, duration: halfDur, ease: 'power2.in' }, 0);
  }

  // Step 2: Midpoint callback
  tl.add(() => {
    if (typeof onMidpoint === 'function') {
      onMidpoint();
    }
  });

  // Step 3: Reset scale/blur and fade overlay out to 0
  if (contentEl && !prefersReducedMotion) {
    tl.set(contentEl, { scale: 1, filter: 'blur(0px)' });
  }

  if (overlayEl) {
    tl.to(overlayEl, { opacity: 0, duration: halfDur, ease: 'power2.out' });
  }

  return tl;
}
