<script lang="ts">
  import { onMount } from 'svelte';

  type Post = {
    title: string;
    author: string;
    score: number;
    url: string;
    permalink: string;
    post_hint?: string;
    is_video: boolean;
    thumbnail?: string;
    preview?: { images: { source: { url: string } }[] };
  };

  let post: Post | null = null;
  let error = '';
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('https://www.reddit.com/r/shitposting/top.json?limit=1&t=day');
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      post = json.data.children[0]?.data ?? null;
      if (!post) error = 'nothing today apparently';
    } catch (e) {
      error = 'reddit said no :(';
    } finally {
      loading = false;
    }
  });

  function imgUrl(p: Post): string | null {
    if (p.preview?.images?.[0]?.source?.url) return p.preview.images[0].source.url;
    if (p.post_hint === 'image') return p.url;
    if (p.thumbnail && p.thumbnail !== 'self' && p.thumbnail !== 'default' && p.thumbnail.startsWith('http')) return p.thumbnail;
    return null;
  }
</script>

<svelte:head>
  <title>lol</title>
</svelte:head>

<main class="wrap">
  {#if loading}
    <p class="muted">loading...</p>
  {:else if error}
    <p class="muted">{error}</p>
  {:else if post}
    <p class="label">top post from r/shitposting today</p>
    <h1>{post.title}</h1>
    <p class="meta">
      u/{post.author} &nbsp;·&nbsp; {post.score.toLocaleString()} upvotes
      &nbsp;·&nbsp; <a href="https://reddit.com{post.permalink}" target="_blank" rel="noreferrer">view on reddit</a>
    </p>

    {#if imgUrl(post)}
      <div class="img-wrap">
        <img src={imgUrl(post)!} alt={post.title} />
      </div>
    {:else if post.is_video}
      <p class="muted">(it's a video — <a href="https://reddit.com{post.permalink}" target="_blank" rel="noreferrer">watch on reddit</a>)</p>
    {:else}
      <p class="muted">(no image — <a href={post.url} target="_blank" rel="noreferrer">open link</a>)</p>
    {/if}
  {/if}
</main>

<style>
  .wrap   { max-width: 720px; }
  .label  { font-size: 12px; opacity: .6; margin: 0 0 8px; }
  h1      { margin: 0 0 8px; font-size: clamp(16px, 3vw, 26px); }
  .meta   { font-size: 12px; opacity: .7; margin: 0 0 20px; }
  .img-wrap { border: 1px solid var(--border); }
  .img-wrap img { display: block; max-width: 100%; height: auto; }
</style>
