<script lang="ts">
  import Topbar from '$lib/components/Topbar.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>alive — {data.metadata.title}</title>
</svelte:head>

<Topbar />

<main class="wrap">
  <article class="post">
    <header class="post-header">
      <h1>{data.metadata.title}</h1>
      <p class="muted">{new Date(data.metadata.date).toLocaleDateString()}</p>
    </header>
    <div class="post-body">
      <svelte:component this={data.content} />
    </div>
  </article>
</main>

<footer class="site-footer">made with svelte + Need coffee &nbsp;·&nbsp; <span class="version">v{__COMMIT__}</span></footer>
