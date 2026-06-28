<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';

  const links = [
    { href: `${base}/`, label: 'home' },
    { href: `${base}/projects`, label: 'my projects' },
    { href: `${base}/logbook`, label: 'logbook' },
    { href: 'https://ckacha.github.io/blawg/', label: 'blog' },
    { href: `${base}/old`, label: 'v1' }
  ];

  const KEY = 'theme';

  function joinBase(b: string, path: string) {
    const normalizedBase = b.endsWith('/') ? b : `${b}/`;
    const cleanPath = String(path).replace(/^\/+/, '');
    return normalizedBase + cleanPath;
  }

  function setIcon() {
    const root = document.documentElement;
    const isLight = root.dataset.theme === 'light';
    const file = isLight ? 'faviconinvert.svg' : 'favicon.svg';
    const href = `${joinBase(base || '/', file)}?v=${isLight ? '1' : '0'}`;

    document
      .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
      .forEach((link) => {
        link.setAttribute('type', 'image/svg+xml');
        link.setAttribute('href', href);
      });
  }

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem(KEY, next);
    setIcon();
  }

  let pressed = false;

  onMount(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem(KEY);

    if (saved === 'light' || saved === 'dark') {
      root.dataset.theme = saved;
    }

    pressed = root.dataset.theme === 'light';
    setIcon();
  });

  $: if (typeof document !== 'undefined') {
    pressed = document.documentElement.dataset.theme === 'light';
  }
</script>

<svelte:head>
  <link rel="icon" type="image/svg+xml" href="{base}/favicon.svg" />
  <link rel="shortcut icon" type="image/svg+xml" href="{base}/favicon.svg" />
</svelte:head>

<header class="topbar">
  <nav class="tabs">
    {#each links as link}
      <a href={link.href} class="tab" target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noreferrer' : undefined}>{link.label}</a>
    {/each}
  </nav>

  <button
    id="toggleTheme"
    class="invert-btn"
    aria-pressed={pressed}
    aria-label="Invert site"
    on:click={toggleTheme}
  >
    invert
  </button>
</header>