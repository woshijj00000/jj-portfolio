// Artwork stays local in both the project folder and the standalone HTML.
function summerAsset(name) {
  return `JJ-portfolio-assets/assets/summer-${name}.webp`;
}

function summerCase() {
  return `<article class="ss-case" aria-label="OneKey Summer Sale">
    <img class="ss-reference" src="JJ-portfolio-assets/assets/summer-layout.png" width="1920" height="9192" alt="OneKey Summer Sale">
    <div class="ss-screen-wrap">
      <div class="ss-display" tabindex="0" role="region" aria-label="可滚动的活动网页预览">
        <img src="${summerAsset('page')}" width="1440" height="3100" alt="OneKey 活动网页">
      </div>
      <i class="ss-notch" aria-hidden="true"></i>
      <button type="button" class="ss-playback" data-demo-toggle aria-label="暂停演示" aria-pressed="true">
        <svg class="ss-pause-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>
        <svg class="ss-play-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="m5 2 9 6-9 6z" fill="currentColor"/></svg>
      </button>
    </div>
  </article>`;
}

// Use the native scrolling surface for mouse, touch and keyboard input.
function startSummerDemo(root) {
  const screen = root.querySelector('.ss-display');
  const toggle = root.querySelector('[data-demo-toggle]');
  let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = false;
  let frame = 0;
  let previousTime = 0;
  let position = 0;
  let direction = 1;
  let holdUntil = 0;

  function step(now) {
    const max = screen.scrollHeight - screen.clientHeight;
    const elapsed = previousTime ? Math.min(50, now - previousTime) : 0;
    previousTime = now;
    if (max > 0 && now >= holdUntil) {
      position += direction * max * elapsed / 18000;
      if (position <= 0 || position >= max) {
        position = Math.min(max, Math.max(0, position));
        direction = position >= max ? -1 : 1;
        holdUntil = now + 1200;
      }
      screen.scrollTop = position;
    }
    frame = requestAnimationFrame(step);
  }

  function synchronize() {
    cancelAnimationFrame(frame);
    previousTime = 0;
    position = screen.scrollTop;
    toggle.setAttribute('aria-label', playing ? '暂停演示' : '播放演示');
    toggle.setAttribute('aria-pressed', String(playing));
    if (playing && visible && !document.hidden) frame = requestAnimationFrame(step);
  }
  function manualScroll() {
    if (!playing) return;
    playing = false;
    synchronize();
  }
  ['wheel', 'pointerdown', 'keydown'].forEach(type => screen.addEventListener(type, manualScroll, { passive: true }));
  toggle.addEventListener('click', () => { playing = !playing; synchronize(); });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    holdUntil = performance.now() + 800;
    synchronize();
  }, {root, threshold: 0.15});
  observer.observe(screen);
  document.addEventListener('visibilitychange', synchronize);
  synchronize();
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange', synchronize);
  };
}
