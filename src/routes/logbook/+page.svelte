<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Topbar from '$lib/components/Topbar.svelte';

  type Entry = {
    id: number;
    type: 'text' | 'draw';
    name: string;
    message?: string;
    drawing?: string;
    created_at: number;
  };

  let entries: Entry[] = [];
  let loading = true;
  let loadError = false;

  let showModal = false;
  let modalTab: 'type' | 'draw' = 'type';
  let name = '';
  let message = '';
  let botCheck = '';
  let showBotCheck = false;
  let submitting = false;
  let statusMsg = '';

  let deleteId: number | null = null;
  let deletePassword = '';
  let deleteError = '';
  let deleting = false;

  function openDelete(id: number) {
    deleteId = id;
    deletePassword = '';
    deleteError = '';
  }

  function closeDelete() { deleteId = null; }

  async function confirmDelete() {
    if (!deletePassword) { deleteError = 'Password required.'; return; }
    deleting = true;
    deleteError = '';
    try {
      const res = await fetch('/api/logbook', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId, password: deletePassword }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        deleteError = data.error ?? 'Failed.';
        return;
      }
      entries = entries.filter(e => e.id !== deleteId);
      closeDelete();
    } catch {
      deleteError = 'Network error.';
    } finally {
      deleting = false;
    }
  }

  let canvas: HTMLCanvasElement;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let drawColor = '#000000';
  let brushSize = 4;

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function loadEntries() {
    loading = true;
    try {
      const res = await fetch('/api/logbook');
      if (!res.ok) throw new Error();
      entries = shuffle(await res.json());
      loadError = false;
    } catch {
      loadError = true;
    } finally {
      loading = false;
    }
  }

  onMount(loadEntries);

  async function openModal() {
    showModal = true;
    showBotCheck = false;
    botCheck = '';
    name = '';
    message = '';
    statusMsg = '';
    modalTab = 'type';
  }

  function closeModal() { showModal = false; }

  async function switchTab(tab: 'type' | 'draw') {
    modalTab = tab;
    if (tab === 'draw') {
      await tick();
      initCanvas();
    }
  }

  function initCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1000, 1000);
  }

  function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const sx = 1000 / rect.width;
    const sy = 1000 / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
    }
    return {
      x: ((e as MouseEvent).clientX - rect.left) * sx,
      y: ((e as MouseEvent).clientY - rect.top) * sy,
    };
  }

  function startDraw(e: MouseEvent | TouchEvent) {
    isDrawing = true;
    const { x, y } = getPos(e);
    lastX = x; lastY = y;
  }

  function onDraw(e: MouseEvent | TouchEvent) {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastX = x; lastY = y;
  }

  function stopDraw() { isDrawing = false; }

  function handleSubmit() {
    statusMsg = '';
    if (!name.trim()) { statusMsg = 'Name is required.'; return; }
    if (modalTab === 'type' && !message.trim()) { statusMsg = 'Message is required.'; return; }
    showBotCheck = true;
  }

  async function confirmSubmit() {
    if (botCheck !== 'Iamnotarobot') {
      statusMsg = 'Type exactly: Iamnotarobot';
      return;
    }
    submitting = true;
    statusMsg = '';
    try {
      const body: Record<string, string> = {
        name: name.trim(),
        bot_check: botCheck,
        type: modalTab === 'type' ? 'text' : 'draw',
      };
      if (modalTab === 'type') {
        body.message = message.trim();
      } else {
        const tmp = document.createElement('canvas');
        tmp.width = 500; tmp.height = 500;
        tmp.getContext('2d')!.drawImage(canvas, 0, 0, 500, 500);
        body.drawing = tmp.toDataURL('image/jpeg', 0.85);
      }
      const res = await fetch('/api/logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        statusMsg = data.error ?? 'Failed.';
        return;
      }
      closeModal();
      await loadEntries();
    } catch {
      statusMsg = 'Network error.';
    } finally {
      submitting = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showModal) closeModal();
  }

  function formatDate(ts: number) {
    return new Date(ts * 1000).toLocaleDateString();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
  <title>logbook</title>
</svelte:head>

<Topbar />

<main class="wrap logbook-wrap">
  <aside class="logbook-side">
    <h1>logbook</h1>
    <p class="muted">notes from people who've passed through</p>
    <button class="invert-btn leave-btn" on:click={openModal}>leave a note</button>
  </aside>

  <div class="entries-grid">
    {#if loading}
      <p class="muted">loading...</p>
    {:else if loadError}
      <p class="muted">couldn't load entries.</p>
    {:else if entries.length === 0}
      <p class="muted">be the first to sign.</p>
    {:else}
      {#each entries as entry (entry.id)}
        <article class="entry-card">
          <button class="entry-delete" on:click={() => openDelete(entry.id)} aria-label="Delete entry">✕</button>
          {#if entry.type === 'draw'}
            <img class="entry-drawing" src={entry.drawing} alt="drawing by {entry.name}" />
            <div class="entry-footer">
              <span class="entry-name">{entry.name}</span>
              <span class="entry-date">{formatDate(entry.created_at)}</span>
            </div>
          {:else}
            <div class="entry-header">
              <span class="entry-name">{entry.name}</span>
              <span class="entry-date">{formatDate(entry.created_at)}</span>
            </div>
            <div class="entry-message">{entry.message ?? ''}</div>
          {/if}
        </article>
      {/each}
    {/if}
  </div>
</main>

<footer class="site-footer">made with svelte, I need some coffee &nbsp;·&nbsp; <span class="version">v{__COMMIT__}</span></footer>

{#if showModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click|self={closeModal}>
    <div class="modal" role="dialog" aria-modal="true">
      <button class="modal-close" on:click={closeModal} aria-label="Close">✕</button>

      <div class="modal-tabs">
        <button class="modal-tab" class:active={modalTab === 'type'} on:click={() => switchTab('type')}>type</button>
        <button class="modal-tab" class:active={modalTab === 'draw'} on:click={() => switchTab('draw')}>draw</button>
      </div>

      {#if modalTab === 'type'}
        <textarea
          class="modal-field"
          bind:value={message}
          placeholder="write something..."
          maxlength="500"
          rows="6"
          disabled={showBotCheck}
        ></textarea>
      {:else}
        <div class="canvas-tools">
          <label class="tool-label">
            color
            <input type="color" bind:value={drawColor} />
          </label>
          <label class="tool-label">
            size
            <input type="range" min="1" max="24" bind:value={brushSize} />
          </label>
          <button class="invert-btn" on:click={() => initCanvas()}>clear</button>
        </div>
        <canvas
          bind:this={canvas}
          width="1000"
          height="1000"
          class="draw-canvas"
          on:mousedown={startDraw}
          on:mousemove={onDraw}
          on:mouseup={stopDraw}
          on:mouseleave={stopDraw}
          on:touchstart|preventDefault={startDraw}
          on:touchmove|preventDefault={onDraw}
          on:touchend={stopDraw}
        ></canvas>
      {/if}

      <input
        class="modal-field"
        bind:value={name}
        placeholder="your name"
        maxlength="50"
        disabled={showBotCheck}
      />

      {#if !showBotCheck}
        <button class="invert-btn" on:click={handleSubmit}>submit</button>
      {:else}
        <div class="bot-check">
          <p>type <strong>Iamnotarobot</strong> to confirm: (you aren't a bot right)</p>
          <div class="bot-row">
            <input class="modal-field" bind:value={botCheck} placeholder="Iamnotarobot" />
            <button class="invert-btn" on:click={confirmSubmit} disabled={submitting}>
              {submitting ? 'sending...' : 'confirm'}
            </button>
          </div>
        </div>
      {/if}

      {#if statusMsg}
        <p class="status-msg">{statusMsg}</p>
      {/if}
    </div>
  </div>
{/if}

{#if deleteId !== null}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click|self={closeDelete}>
    <div class="modal delete-modal" role="dialog" aria-modal="true">
      <button class="modal-close" on:click={closeDelete} aria-label="Close">✕</button>
      <p style="margin:0; font-size:13px;">enter password to delete this entry:</p>
      <input
        class="modal-field"
        type="password"
        bind:value={deletePassword}
        placeholder="password"
        on:keydown={(e) => e.key === 'Enter' && confirmDelete()}
      />
      <div class="bot-row">
        <button class="invert-btn" on:click={closeDelete}>cancel</button>
        <button class="invert-btn" on:click={confirmDelete} disabled={deleting}>
          {deleting ? 'deleting...' : 'delete'}
        </button>
      </div>
      {#if deleteError}<p class="status-msg">{deleteError}</p>{/if}
    </div>
  </div>
{/if}

<style>
  .logbook-wrap {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 2rem;
    align-items: start;
  }

  .logbook-side {
    position: sticky;
    top: 3.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .logbook-side h1 { margin: 0; }
  .logbook-side p  { margin: 0; }

  .leave-btn {
    width: 100%;
    padding: 0.6rem 0;
    font-size: 15px;
    margin-block-start: 0.5rem;
  }

  .entries-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  .entry-card {
    border: 1px solid var(--border);
    height: 200px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .entry-delete {
    position: absolute;
    top: 4px;
    right: 4px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--ink);
    font: inherit;
    font-size: 11px;
    line-height: 1;
    padding: 2px 5px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 1;
  }
  .entry-card:hover .entry-delete { opacity: 1; }

  .delete-modal { max-width: 340px; gap: 0.75rem; }

  .entry-header, .entry-footer {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 6px 10px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--border);
  }

  .entry-footer {
    border-bottom: none;
    border-top: 1px solid var(--border);
    margin-block-start: auto;
  }

  .entry-name { font-weight: 700; font-size: 13px; }
  .entry-date { font-size: 11px; opacity: 0.5; }

  .entry-message {
    flex: 1;
    padding: 8px 10px;
    font-size: 13px;
    line-height: 1.5;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
  }

  .entry-drawing {
    flex: 1;
    width: 100%;
    object-fit: cover;
    object-position: top left;
    min-height: 0;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: var(--bg);
    border: 1px solid var(--border);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 1.5rem;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: none;
    border: none;
    color: var(--ink);
    font: inherit;
    font-size: 16px;
    cursor: pointer;
    opacity: 0.5;
    line-height: 1;
    padding: 0;
  }
  .modal-close:hover { opacity: 1; }

  .modal-tabs { display: flex; gap: 0.5rem; }

  .modal-tab {
    background: none;
    border: 1px solid var(--border);
    color: var(--ink);
    font: inherit;
    font-size: 13px;
    padding: 4px 16px;
    cursor: pointer;
    opacity: 0.5;
  }
  .modal-tab.active { opacity: 1; border-color: var(--ink); }
  .modal-tab:hover { opacity: 1; }

  .modal-field {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--ink);
    font: inherit;
    font-size: 13px;
    padding: 7px 9px;
    box-sizing: border-box;
    resize: vertical;
  }

  .canvas-tools {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .tool-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 12px;
    opacity: 0.7;
  }

  .draw-canvas {
    width: 100%;
    aspect-ratio: 1;
    border: 1px solid var(--border);
    cursor: crosshair;
    touch-action: none;
    display: block;
    background: #fff;
  }

  .bot-check { display: flex; flex-direction: column; gap: 0.5rem; font-size: 13px; }
  .bot-check p { margin: 0; }

  .bot-row { display: flex; gap: 0.5rem; }
  .bot-row .modal-field { flex: 1; }

  .status-msg { margin: 0; font-size: 12px; color: var(--muted); }
</style>
