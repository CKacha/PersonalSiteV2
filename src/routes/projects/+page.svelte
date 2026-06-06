<script lang="ts">
    import { onMount } from 'svelte';
    import Topbar from '$lib/components/Topbar.svelte';

    type Repo = {
        id: number;
        name: string;
        html_url: string;
        description: string | null;
        stargazers_count: number;
        updated_at: string;
        fork: boolean;
    };

    type ArtImage = {
        src: string;
        alt: string;
        caption: string;
    };

    const user = 'Ckacha';
    let repos: Repo[] = [];
    let failed = false;

    const images: ArtImage[] = [];

    onMount(async () => {
        try {
            const res = await fetch(
                `https://api.github.com/users/${user}/repos?sort=updated&per_page=30`
            );
            if (!res.ok) {
                failed = true;
                return;
            }
            const data = await res.json();

            if (!Array.isArray(data)) {
                failed = true;
                return;
            }

            repos = data.filter((r: Repo) => !r.fork).slice(0, 20);
        } catch {
            failed = true;
        }
    });
</script>

<Topbar />

<main class="wrap">
  <h1>my projects</h1>

  <section>
    <h2>code</h2>
    <div class="cards">
      {#if failed}
        <p class="muted">Failed to load repos.</p>
      {:else if repos.length === 0}
        <p class="muted">Nothing to show yet.</p>
      {:else}
        {#each repos as repo}
          <article class="card">
            <div class="repo-title">
              <a href={repo.html_url} target="_blank" rel="noreferrer">{repo.name}</a>
            </div>
            <div class="repo-desc">{repo.description ?? ''}</div>
            <div class="repo-meta">
              <span>★ {repo.stargazers_count}</span>
              <span>updated {new Date(repo.updated_at).toLocaleDateString()}</span>
            </div>
          </article>
        {/each}
      {/if}
    </div>
  </section>

  <section>
    <h2>art</h2>
    <div class="art-grid">
      {#each images as image}
        <figure class="art-card">
          <img src={image.src} alt={image.alt} loading="lazy" />
          <figcaption>{image.caption}</figcaption>
        </figure>
      {/each}
    </div>
  </section>
</main>

<footer class="site-footer">made with svelte + Need coffee</footer>
