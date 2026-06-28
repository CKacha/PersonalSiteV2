<script lang="ts">
  import { onMount } from 'svelte';

  let v1El: HTMLDivElement;

  onMount(() => {
    const boot     = v1El.querySelector<HTMLDivElement>('.v1-boot')!;
    const out      = v1El.querySelector<HTMLPreElement>('.v1-boot-lines')!;
    const flash    = v1El.querySelector<HTMLDivElement>('.v1-flash')!;
    const reveal   = v1El.querySelector<HTMLDivElement>('.v1-reveal')!;
    const hello    = v1El.querySelector<HTMLHeadingElement>('#v1-hello')!;
    const statusWrap = v1El.querySelector<HTMLDivElement>('#v1-status-wrap')!;
    const statusBox  = statusWrap?.querySelector<HTMLDivElement>('.v1-status')!;
    const closeBtn   = statusWrap?.querySelector<HTMLButtonElement>('.v1-x')!;
    const themeBtn   = v1El.querySelector<HTMLButtonElement>('#v1-toggle')!;

    let reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) {}
    const charDelay = reduce ? 0 : 35;
    const linePause = reduce ? 120 : 350;
    const lines = ['> booting aliveOS...', '> loading thoughts...', '> ready.'];
    let li = 0, ci = 0;

    function typeChar() {
      if (li >= lines.length) {
        boot.classList.add('v1-boot--hide');
        if (!reduce) {
          flash.classList.add('v1-flash--go');
          setTimeout(() => reveal.classList.add('v1-reveal--go'), 110);
          setTimeout(finishBoot, 600);
        } else {
          finishBoot();
        }
        return;
      }
      const text = lines[li];
      if (ci === 0 && li > 0) out.appendChild(document.createTextNode('\n'));
      out.appendChild(document.createTextNode(text.charAt(ci++)));
      if (ci < text.length) setTimeout(typeChar, charDelay);
      else { ci = 0; li++; setTimeout(typeChar, linePause); }
    }

    function finishBoot() {
      flash?.remove();
      reveal?.remove();
      if (!hello) return;
      const text = "Hi, I'm Alive";
      let i = 0;
      const d = reduce ? 0 : 45;
      hello.classList.add('v1-type-caret');
      (function next() {
        if (i < text.length) { hello.textContent += text.charAt(i++); setTimeout(next, d); }
        else { hello.classList.remove('v1-type-caret'); }
      })();
    }

    typeChar();

    if (sessionStorage.getItem('v1-status-closed') === '1') {
      statusWrap.style.display = 'none';
    } else {
      let raf = 0;
      let x = window.innerWidth * 0.12;
      let y = window.innerHeight * 0.18;
      let vx = 1.1, vy = 1.0;
      const M = 8;

      function frame() {
        const r = statusBox.getBoundingClientRect();
        x += vx; y += vy;
        if (x <= M || x + r.width  >= window.innerWidth  - M) vx *= -1;
        if (y <= M || y + r.height >= window.innerHeight - M) vy *= -1;
        statusWrap.style.left = Math.max(M, Math.min(window.innerWidth  - r.width  - M, x)) + 'px';
        statusWrap.style.top  = Math.max(M, Math.min(window.innerHeight - r.height - M, y)) + 'px';
        raf = requestAnimationFrame(frame);
      }
      function startBounce() { if (!reduce && !raf) raf = requestAnimationFrame(frame); }
      function stopBounce()  { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

      closeBtn.addEventListener('click', () => {
        sessionStorage.setItem('v1-status-closed', '1');
        stopBounce();
        statusWrap.style.display = 'none';
      });

      let dragging = false, dx = 0, dy = 0;
      statusBox.addEventListener('mousedown', (e) => {
        dragging = true; stopBounce();
        const rr = statusWrap.getBoundingClientRect();
        dx = e.clientX - rr.left; dy = e.clientY - rr.top;
        document.body.style.userSelect = 'none';
      });
      window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        statusWrap.style.left = (e.clientX - dx) + 'px';
        statusWrap.style.top  = (e.clientY - dy) + 'px';
      });
      window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false; document.body.style.userSelect = '';
        startBounce();
      });

      document.addEventListener('visibilitychange', () => { document.hidden ? stopBounce() : startBounce(); });
      window.addEventListener('blur',  stopBounce);
      window.addEventListener('focus', startBounce);
      startBounce();
    }

    themeBtn.addEventListener('click', () => {
      const cur = v1El.getAttribute('data-v1-theme') ?? 'dark';
      v1El.setAttribute('data-v1-theme', cur === 'dark' ? 'light' : 'dark');
    });
  });
</script>

<svelte:head>
  <title>alive - da old version</title>
</svelte:head>

<div class="v1" data-v1-theme="dark" bind:this={v1El}>

  <div class="v1-boot">
    <pre class="v1-boot-lines"></pre>
  </div>
  <div class="v1-flash" aria-hidden="true"></div>
  <div class="v1-reveal" aria-hidden="true">
    <div class="v1-bar v1-bar-left"></div>
    <div class="v1-bar v1-bar-right"></div>
  </div>

  <header class="v1-topbar">
    <nav class="v1-tabs">
      <a href="/"         class="v1-tab">home</a>
      <a href="/projects" class="v1-tab">my projects</a>
      <a href="/logbook"  class="v1-tab">logbook</a>
      <a href="https://ckacha.github.io/blawg/" target="_blank" rel="noreferrer" class="v1-tab">blog</a>
    </nav>
    <button id="v1-toggle" class="v1-invert-btn">invert</button>
  </header>

  <main class="v1-wrap">
    <h1 id="v1-hello" class="v1-h1"></h1>
    <p>I'm a Junior in high school, and I create stuff</p>

    <section aria-label="my socials" class="v1-ticker">
      <div class="v1-ticker-head">my socials</div>
      <div class="v1-ticker-viewport">
        <div class="v1-ticker-track">
          <span class="v1-item"><a href="https://github.com/ChanminK" target="_blank" rel="noreferrer">github.com/ChanminK</a></span>
          <span class="v1-sep">•</span>
          <span class="v1-item">@Iamalive (slack)</span>
          <span class="v1-sep">•</span>
          <span class="v1-item">thisischanmin@gmail.com</span>
          <span class="v1-sep">•</span>
          <span class="v1-item"><a href="https://github.com/ChanminK" target="_blank" rel="noreferrer">github.com/ChanminK</a></span>
          <span class="v1-sep">•</span>
          <span class="v1-item">@Iamalive (slack)</span>
          <span class="v1-sep">•</span>
          <span class="v1-item">thisischanmin@gmail.com</span>
        </div>
        <div class="v1-ticker-track" aria-hidden="true">
          <span class="v1-item"><a href="https://github.com/ChanminK" target="_blank" rel="noreferrer">github.com/ChanminK</a></span>
          <span class="v1-sep">•</span>
          <span class="v1-item">@Iamalive (slack)</span>
          <span class="v1-sep">•</span>
          <span class="v1-item">thisischanmin@gmail.com</span>
          <span class="v1-sep">•</span>
          <span class="v1-item"><a href="https://github.com/ChanminK" target="_blank" rel="noreferrer">github.com/ChanminK</a></span>
          <span class="v1-sep">•</span>
          <span class="v1-item">@Iamalive (slack)</span>
          <span class="v1-sep">•</span>
          <span class="v1-item">thisischanmin@gmail.com</span>
        </div>
      </div>
    </section>

    <div class="v1-archive-notice">
      ← <a href="/">back to v2</a> &nbsp;·&nbsp; archive of the original site i made for acon's ysws(was made in astro but ts is svelte)
    </div>
  </main>

  <div id="v1-status-wrap" class="v1-floating" style="left: 12vw; top: 18vh;">
    <div class="v1-status">
      <span class="v1-tag">Now Playing:</span>&nbsp;<span>lo-fi study loop</span>
      <button class="v1-x" aria-label="Close status">&times;</button>
    </div>
  </div>

  <footer class="v1-site-footer">made with astro + I need coffee</footer>
</div>

<style>
  .v1 {
    --v1-bg:   #000;
    --v1-ink:  #fff;
    --v1-link: #7fc7ff;
    --v1-lh:   #a8d6ff;

    background:  var(--v1-bg);
    color:       var(--v1-ink);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
    font-size:   14px;
    line-height: 1.4;
    min-height:  100vh;
    -webkit-font-smoothing: none;
  }
  :global(.v1[data-v1-theme="light"]) {
    --v1-bg:   #fff;
    --v1-ink:  #000;
    --v1-link: #0b6bff;
    --v1-lh:   #2f85ff;
  }

  .v1-boot {
    position: fixed; inset: 0; z-index: 9999;
    background: var(--v1-bg); color: var(--v1-ink);
    display: grid; place-items: center;
  }
  :global(.v1-boot--hide) { display: none; }
  .v1-boot-lines {
    margin: 0;
    font: 16px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    white-space: pre; padding: 16px; border: 2px solid var(--v1-ink);
  }

  .v1-flash {
    position: fixed; inset: 0; z-index: 9998;
    background: #fff; opacity: 0; pointer-events: none;
  }
  :global(.v1-flash--go) { animation: v1-flash-pop 220ms steps(2,end) 1 both; }
  @keyframes v1-flash-pop { 0% { opacity:0; } 40% { opacity:1; } 100% { opacity:0; } }

  .v1-reveal {
    position: fixed; inset: 0; z-index: 9997;
    pointer-events: none; display: grid; place-items: center; opacity: 0;
  }
  :global(.v1-reveal--go) { opacity: 1; }
  .v1-bar { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--v1-ink); }
  .v1-bar-left  { left: 50%; transform: translateX(-1px); }
  .v1-bar-right { left: 50%; transform: translateX(1px); }
  :global(.v1-reveal--go .v1-bar-left)  { animation: v1-bar-left-out  300ms steps(24,end) 1 forwards; }
  :global(.v1-reveal--go .v1-bar-right) { animation: v1-bar-right-out 300ms steps(24,end) 1 forwards; }
  @keyframes v1-bar-left-out  { from { transform: translateX(-1px); } to { transform: translateX(calc(-50vw - 1px)); } }
  @keyframes v1-bar-right-out { from { transform: translateX( 1px); } to { transform: translateX(calc( 50vw + 1px)); } }

  :global(.v1-type-caret::after) { content: "▮"; margin-left: 4px; animation: v1-blink 1s steps(1,end) infinite; }
  @keyframes v1-blink { 50% { opacity: 0; } }

  .v1-topbar {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; border-bottom: 2px solid var(--v1-ink);
    background: var(--v1-bg);
  }
  .v1-tabs { display: flex; gap: 12px; }
  .v1-tab {
    color: var(--v1-ink); text-decoration: none;
    border: 2px solid var(--v1-ink); padding: 4px 8px;
  }
  .v1-tab:hover { background: var(--v1-ink); color: var(--v1-bg); }
  .v1-invert-btn {
    appearance: none; background: transparent; color: var(--v1-ink);
    border: 2px solid var(--v1-ink); padding: 6px 10px; cursor: pointer;
    font-weight: 700; text-transform: lowercase;
    font-family: inherit; font-size: inherit;
  }

  .v1-wrap { max-width: 880px; margin: 80px auto 40px; padding: 0 16px; }
  .v1-h1   { margin: 0 0 8px; font-size: clamp(22px, 4.5vw, 36px); }

  .v1-ticker        { border: 2px solid var(--v1-ink); margin: 16px 0; }
  .v1-ticker-head   { border-bottom: 2px solid var(--v1-ink); padding: 6px 10px; font-weight: 700; text-transform: lowercase; }
  .v1-ticker-viewport {
    position: relative; overflow: hidden;
    white-space: nowrap; line-height: 36px; height: 36px;
  }
  .v1-ticker-track {
    display: inline-block; padding-right: 40px;
    animation: v1-ticker-x 18s steps(60,end) infinite;
    will-change: transform;
  }
  .v1-item { display: inline-block; padding: 0 10px; }
  .v1-sep  { display: inline-block; opacity: .7;    padding: 0 8px; }
  @keyframes v1-ticker-x { from { transform: translateX(0); } to { transform: translateX(-100%); } }
  @media (prefers-reduced-motion: reduce) { .v1-ticker-track { animation: none; } }

  .v1 a, .v1 a:visited { color: var(--v1-link); text-decoration: none; }
  .v1 a:hover          { color: var(--v1-lh);   text-decoration: underline; }

  .v1-floating { position: fixed; z-index: 40; }
  .v1-status {
    border: 2px solid var(--v1-ink); background: var(--v1-bg); color: var(--v1-ink);
    padding: 8px 10px; font-size: 12px; line-height: 1.3;
    white-space: nowrap; position: relative; cursor: grab;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  .v1-status:active { cursor: grabbing; }
  .v1-tag { font-weight: 700; }
  .v1-x {
    position: absolute; top: -10px; right: -10px;
    width: 22px; height: 22px; line-height: 20px; text-align: center;
    border: 2px solid var(--v1-ink); background: var(--v1-bg); color: var(--v1-ink);
    font: inherit; cursor: pointer; padding: 0;
  }

  .v1-archive-notice {
    margin: 32px 0 16px; padding: 8px 10px;
    border: 2px solid var(--v1-ink); font-size: 12px; opacity: .7;
  }

  .v1-site-footer {
    max-width: 880px; margin: 32px auto 24px;
    padding: 8px 16px; border-top: 2px solid var(--v1-ink); font-size: 14px;
  }
</style>
