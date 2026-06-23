<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Topbar from '$lib/components/Topbar.svelte';
  import {
    addDoc,
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    type CollectionReference
  } from 'firebase/firestore';

  type Entry = {
    id: string;
    name?: string;
    message?: string;
    createdAt?: any;
  };

  let name = '';
  let msg = '';
  let website = '';
  let status = '';
  let entries: Entry[] = [];
  let loadingError = false;

  let col: CollectionReference | null = null;
  let unsub: (() => void) | null = null;

  function escapeHtml(s: string) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c] || c));
  }

  function formatMessage(s: string) {
    return escapeHtml(s).replace(/\n/g, '<br>');
  }

  onMount(async () => { 
    const { db } = await import('$lib/firebase');
    col = collection(db, 'guestbook');
    const q = query(col, orderBy('createdAt', 'desc'), limit(100));

    unsub = onSnapshot(
      q,
      (snap) => {
        loadingError = false;
        entries = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Entry[];
      },
      (err) => {
        console.error(err);
        loadingError = true;
      }
    );
  });

  onDestroy(() => unsub?.());

  async function submitForm(e: SubmitEvent) {
    e.preventDefault();
    status = '';

    if (website.trim()) return;

    const cleanName = name.trim();
    const cleanMsg = msg.trim();
    if (!cleanName || !cleanMsg) return;
    if (!col) return;

    try {
      if (cleanName.length > 50 || cleanMsg.length > 500) {
        throw new Error('Too long.');
      }

      await addDoc(col, {
        name: cleanName,
        message: cleanMsg,
        createdAt: serverTimestamp()
      });

      msg = '';
      status = 'Sent!';
      setTimeout(() => {
        status = '';
      }, 1500);
    } catch (err) {
      console.error(err);
      status = 'Failed to send.';
    }
  }
</script>

<svelte:head>
  <title>logbook</title>
</svelte:head>

<Topbar />

<main class="wrap">
  <h1>logbook</h1>
  <p class="muted">Leave a note!</p>

  <form class="block-form" on:submit={submitForm}>
    <div class="row">
      <label class="label" for="name">name</label>
      <input id="name" bind:value={name} required maxlength="50" />
    </div>

    <div class="row">
      <label class="label" for="msg">message</label>
      <textarea id="msg" bind:value={msg} rows="4" required maxlength="500"></textarea>
    </div>

    <input
      type="text"
      bind:value={website}
      style="position:absolute;left:-5000px;top:auto;width:1px;height:1px;opacity:0;"
      tabindex="-1"
      aria-hidden="true"
    />

    <button type="submit" class="invert-btn">submit</button>
    <span class="muted" style="margin-left:8px;">{status}</span>
  </form>

  <section style="margin-top:24px">
    <h2>entries</h2>
    <div class="cards">
      {#if loadingError}
        <p class="muted">Failed to load entries.</p>
      {:else if entries.length === 0}
        <p class="muted">Be the first to sign.</p>
      {:else}
        {#each entries as entry}
          <article class="card">
            <div class="repo-title">{entry.name || 'someone'}</div>
            <div class="repo-desc">{@html formatMessage(entry.message || '')}</div>
            <div class="repo-meta">
              <span>
                {entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
              </span>
            </div>
          </article>
        {/each}
      {/if}
    </div>
  </section>
</main>

<footer class="site-footer">made with svelte, I need caffiene &nbsp;·&nbsp; <span class="version">v{__COMMIT__}</span></footer>