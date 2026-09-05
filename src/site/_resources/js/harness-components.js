(() => {
  const section = document.querySelector('main#main-content [data-harness-components]');
  if (!section) return;
  const button = section.querySelector('.harness-motion-control');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  function sync() {
    section.dataset.motionPaused = String(paused || reducedMotion.matches);
    button.hidden = reducedMotion.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Resume diagrams' : 'Pause diagrams';
  }
  button.addEventListener('click', () => { paused = !paused; sync(); });
  reducedMotion.addEventListener('change', sync);
  sync();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      section.dataset.motionVisible = String(entry.isIntersecting);
    }, { threshold: 0.1 }).observe(section);
  } else {
    section.dataset.motionVisible = 'true';
  }
})();
