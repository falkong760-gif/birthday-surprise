import gsap from 'gsap';

export function fadeOutScene(el, duration = 0.4) {
  if (!el) return Promise.resolve();
  return new Promise((resolve) => {
    gsap.to(el, {
      opacity: 0,
      scale: 0.98,
      filter: 'blur(4px)',
      duration,
      ease: 'power2.inOut',
      onComplete: resolve,
    });
  });
}

export function fadeInScene(el, duration = 0.4) {
  if (!el) return Promise.resolve();
  return new Promise((resolve) => {
    gsap.fromTo(
      el,
      {
        opacity: 0,
        scale: 1.02,
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration,
        ease: 'power2.out',
        onComplete: resolve,
      }
    );
  });
}

export function fadeThroughBlack(containerEl, onMidpoint, duration = 0.8) {
  if (!containerEl) {
    if (onMidpoint) onMidpoint();
    return Promise.resolve();
  }

  const half = duration / 2;

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: resolve,
    });

    tl.to(containerEl, {
      opacity: 0,
      scale: 0.97,
      filter: 'blur(6px)',
      duration: half,
      ease: 'power2.in',
      onComplete: () => {
        if (onMidpoint) onMidpoint();
      },
    }).to(containerEl, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: half,
      ease: 'power2.out',
    });
  });
}
