<script lang="ts">
    import { onMount } from "svelte";

    export let label = 'Now Thinking';
    export let value = 'Booting ideas...';
    export let mode: 'docked' | 'bounce' = 'docked';
    export let storageKey = 'status-box';

    let root: HTMLDivElement;
    let box: HTMLDivElement;
    let hidden = false;

    let raf = 0;
    let  x = 0;
    let  y = 0
    let  vx = 1.1;
    let vy = 1.0;
    const M = 8;
    let reduce = false;

    let dragging = false;
    let dx = 0;
    let dy = 0;

    function stop() {
        if (raf) cancelAnimationFrame(raf);
        raf =  0;
    }

    function frame() {
        if (!root || !box) return;

        const r = box.getBoundingClientRect();
        const bw = r.width;
        const bh = r.height;

        x += vx;
        y += vy;

        if (x <= M || x + bw >= innerWidth - M) vx *= -1;
        if (y <= M || y + bh >= innerHeight - M) vy *= -1;

        root.style.left = `${Math.max(M, Math.min(innerWidth - bw - M, x))}px`;
        root.style.top = `${Math.max(M, Math.min(innerHeight - bh - M, y))}px`;

        raf = requestAnimationFrame(frame);
    }

    function start() {
        if (!reduce && !raf && mode === 'bounce') {
        raf = requestAnimationFrame(frame);
        }
    }

    function closeBox() {
    sessionStorage.setItem(`${storageKey}-closed`, '1');
    stop();
    hidden = true;
  }

    function onMouseDown(e: MouseEvent) {
        if (!root) return;
        dragging = true;
        stop();
        const rr = root.getBoundingClientRect();
        dx = e.clientX - rr.left;
        dy = e.clientY - rr.top;
        document.body.style.userSelect = 'none';
    }

    function onMouseMove(e: MouseEvent) {
        if (!dragging || !root) return;
        root.style.left = `${e.clientX - dx}px`;
        root.style.top = `${e.clientY - dy}px`;
    }

    function onMouseUp() {
        if (!dragging) return;
        dragging = false;
        document.body.style.userSelect = '';
        start();
    }

    onMount(() => {
        if (sessionStorage.getItem(`${storageKey}-closed`) === '1') {
            hidden = true;
            return;
        }

        try {
            reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch {
            reduce = false;
        }

        if (mode === 'bounce' && root) {
            x = Math.max(8, root.offsetLeft || innerWidth * 0.12);
            y = Math.max(8, root.offsetTop || innerHeight * 0.18);
        start();
        }

        const onVisibility = () => (document.hidden ? stop() : start());
        const onBlur = () => stop();
        const onFocus = () => start();

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);

        return () => {
            stop();
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('focus', onFocus);
            document.body.style.userSelect = '';
        };
    });
</script>

{#if !hidden}
    <div
        bind:this={root}
        class:status-wrap={true}
        class:floating={mode === 'bounce'}
        data-key={storageKey}
        data-mode={mode}
        data-label={label}
        data-value={value}
    >
        <div
            bind:this={box}
            class="status"
            role="status"
            aria-live="polite"
            on:mousedown={mode === 'bounce' ? onMouseDown : undefined}
        >
            <span class="tag">{label}:</span>&nbsp;<span class="value">{value}</span>
            <button class="x" aria-label="Close status" on:click={closeBox}>&times;</button>
        </div>
    </div>
{/if}

<style>
    .floating {
        position: fixed;
        left: 12vw;
        top: 18vh;
        margin: 0;
        z-index: 40;
    }
</style>