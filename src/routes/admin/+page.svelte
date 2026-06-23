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

    type ProjectConfig = {
        enabled: boolean;
        description: string;
    };

    type ProjectsStore = Record<string, ProjectConfig>;

    let repos: Repo[] = [];
    let projectConfig: ProjectsStore = {};
    let loading = false;
    let saveMsg = '';

    function updateProject(name: string, patch: Partial<ProjectConfig>) {
        projectConfig = {
            ...projectConfig,
            [name]: { ...projectConfig[name], ...patch }
        };
    }

    async function fetchRepos() {
        loading = true;
        try {
            const res = await fetch(
                'https://api.github.com/users/Ckacha/repos?sort=updated&per_page=100'
            );
            const data = await res.json();
            if (Array.isArray(data)) {
                const filtered = data.filter((r: Repo) => !r.fork);
                const newConfig = { ...projectConfig };
                filtered.forEach((r: Repo) => {
                    if (!newConfig[r.name]) {
                        newConfig[r.name] = {
                            enabled: false,
                            description: r.description ?? ''
                        };
                    }
                });
                projectConfig = newConfig;
                repos = filtered;
            }
        } catch {
            repos = [];
        }
        loading = false;
    }

    function save() {
        localStorage.setItem('projects_config', JSON.stringify(projectConfig));
        saveMsg = 'saved.';
        setTimeout(() => (saveMsg = ''), 2000);
    }

    onMount(() => {
        const stored = localStorage.getItem('projects_config');
        if (stored) {
            try {
                projectConfig = JSON.parse(stored);
            } catch {}
        }
        fetchRepos();
    });
</script>

<Topbar />

<main class="wrap">
    <h1>admin</h1>

    <div class="admin-bar">
        <p class="muted">toggle repos on/off and edit their descriptions</p>
        <button class="invert-btn save-btn" on:click={save}>
            save{saveMsg ? ' — ' + saveMsg : ''}
        </button>
    </div>

    {#if loading}
        <p class="muted">fetching repos...</p>
    {:else if repos.length === 0}
        <p class="muted">no repos found.</p>
    {:else}
        <div class="project-list">
            {#each repos as repo (repo.name)}
                <div class="proj-row" class:proj-on={projectConfig[repo.name]?.enabled}>
                    <div class="proj-top">
                        <label class="toggle-wrap">
                            <input
                                type="checkbox"
                                checked={projectConfig[repo.name]?.enabled ?? false}
                                on:change={(e) =>
                                    updateProject(repo.name, {
                                        enabled: e.currentTarget.checked
                                    })}
                            />
                            <span class="toggle-tag">
                                {projectConfig[repo.name]?.enabled ? '[on] ' : '[off]'}
                            </span>
                        </label>
                        <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            class="proj-name">{repo.name}</a
                        >
                        <span class="proj-meta">
                            ★{repo.stargazers_count} · {new Date(
                                repo.updated_at
                            ).toLocaleDateString()}
                        </span>
                    </div>
                    <div class="proj-desc-row">
                        <span class="muted desc-label">desc:</span>
                        <input
                            type="text"
                            class="desc-input"
                            placeholder={repo.description ?? 'no description'}
                            value={projectConfig[repo.name]?.description ?? ''}
                            on:input={(e) =>
                                updateProject(repo.name, {
                                    description: e.currentTarget.value
                                })}
                        />
                    </div>
                </div>
            {/each}
        </div>
        <div class="save-bar">
            <button class="invert-btn save-btn" on:click={save}>
                save changes{saveMsg ? ' — ' + saveMsg : ''}
            </button>
        </div>
    {/if}
</main>

<style>
    .admin-bar {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-block: 1.5rem 2rem;
        flex-wrap: wrap;
    }

    .project-list {
        display: flex;
        flex-direction: column;
        gap: 0;
        border: 1px solid var(--border);
    }

    .proj-row {
        padding: 0.6rem 0.75rem;
        border-bottom: 1px solid var(--border);
        opacity: 0.5;
        transition: opacity 0.1s;
    }

    .proj-row:last-child {
        border-bottom: none;
    }

    .proj-row.proj-on {
        opacity: 1;
    }

    .proj-top {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-block-end: 0.3rem;
    }

    .toggle-wrap {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        cursor: pointer;
    }

    .toggle-wrap input[type='checkbox'] {
        display: none;
    }

    .toggle-tag {
        font-size: 11px;
        font-family: inherit;
        color: var(--muted);
        min-width: 4ch;
    }

    .proj-on .toggle-tag {
        color: var(--ink);
    }

    .proj-name {
        font-weight: 700;
        font-size: 13px;
    }

    .proj-meta {
        font-size: 11px;
        opacity: 0.4;
        margin-inline-start: auto;
    }

    .proj-desc-row {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .desc-label {
        font-size: 11px;
        flex-shrink: 0;
    }

    .desc-input {
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--border);
        color: var(--ink);
        font: inherit;
        font-size: 12px;
        width: 100%;
        padding: 1px 2px;
    }

    .desc-input:focus {
        outline: none;
        border-bottom-color: var(--ink);
    }

    .desc-input::placeholder {
        color: var(--muted);
        opacity: 0.6;
    }

    .save-bar {
        margin-block-start: 1rem;
    }

    .save-btn {
        min-width: 10ch;
    }
</style>
