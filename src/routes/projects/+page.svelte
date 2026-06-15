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
    let notConfigured = false;

    const images: ArtImage[] = [];

    onMount(async () => {
        const stored = localStorage.getItem('projects_config');
        if (!stored) {
            notConfigured = true;
            return;
        }

        let config: Record<string, { enabled: boolean; description: string }> = {};
        try {
            config = JSON.parse(stored);
        } catch {
            notConfigured = true;
            return;
        }

        const enabledNames = Object.entries(config)
            .filter(([, v]) => v.enabled)
            .map(([k]) => k);

        if (enabledNames.length === 0) {
            notConfigured = true;
            return;
        }

        try {
            const res = await fetch(
                `https://api.github.com/users/${user}/repos?sort=updated&per_page=100`
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

            repos = data
                .filter((r: Repo) => !r.fork && enabledNames.includes(r.name))
                .map((r: Repo) => ({
                    ...r,
                    description: config[r.name]?.description || r.description
                }));
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
            {#if notConfigured}
                <p class="muted">
                    no projects configured — <a href="/admin">visit /admin</a> to choose what to
                    display.
                </p>
            {:else if failed}
                <p class="muted">Failed to load repos.</p>
            {:else if repos.length === 0}
                <p class="muted">Loading...</p>
            {:else}
                {#each repos as repo}
                    <article class="card">
                        <div class="repo-title">
                            <a href={repo.html_url} target="_blank" rel="noreferrer"
                                >{repo.name}</a
                            >
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

<footer class="site-footer">made with svelte + Need coffee &nbsp;·&nbsp; <span class="version">v{__COMMIT__}</span></footer>
