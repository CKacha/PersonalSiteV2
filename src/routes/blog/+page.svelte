<script lang="ts">
  import { base } from '$app/paths';
  import Topbar from '$lib/components/Topbar.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>alive — blog</title>
</svelte:head>

<Topbar />

<main class="wrap">
  <h1>blog</h1>

  {#if data.posts.length === 0}
    <p class="muted">Nothing posted yet.</p>
  {:else}
    <div class="cards">
      {#each data.posts as post}
        <article class="card">
          <div class="repo-title">
            <a href="{base}/blog/{post.slug}">{post.title}</a>
          </div>
          {#if post.description}
            <div class="repo-desc">{post.description}</div>
          {/if}
          <div class="repo-meta">
            <span>{new Date(post.date).toLocaleDateString()}</span>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</main>

<footer class="site-footer">made with svelte + Need coffee &nbsp;·&nbsp; <span class="version">v{__COMMIT__}</span></footer>
