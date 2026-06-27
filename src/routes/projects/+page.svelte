<script lang="ts">
    import Topbar from '$lib/components/Topbar.svelte';
    import { projects } from '$lib/projects';
</script>

<svelte:head>
    <title>Projects</title>
</svelte:head>

<Topbar />

<main class="wrap">
    <h1>my projects</h1>

    <div class="cards">
        {#each projects as project}
            <article class="card project-card">
                <div class="project-top">
                    <div class="project-name-row">
                        <span class="repo-title">{project.name}</span>
                        {#if project.subtitle}
                            <span class="project-subtitle">{project.subtitle}</span>
                        {/if}
                    </div>
                    {#if project.langs && project.langs.length > 0}
                        <div class="project-langs">
                            {#each project.langs as lang}
                                <span class="lang-tag">{lang}</span>
                            {/each}
                        </div>
                    {/if}
                </div>

                <div class="project-body">
                    <div class="project-left">
                        {#if project.description}
                            <div class="repo-desc">{@html project.description}</div>
                        {/if}
                        {#if project.source || project.visit}
                            <div class="project-links">
                                {#if project.visit}
                                    <a href={project.visit} target="_blank" rel="noreferrer">visit</a>
                                {/if}
                                {#if project.source}
                                    <a href={project.source} target="_blank" rel="noreferrer">source</a>
                                {/if}
                            </div>
                        {/if}
                    </div>
                    {#if project.image}
                        <img class="project-image" src={project.image} alt={project.name} loading="lazy" />
                    {/if}
                </div>
            </article>
        {/each}
    </div>
</main>

<footer class="site-footer">made with svelte, I need some coffee &nbsp;·&nbsp; <span class="version">v{__COMMIT__}</span></footer>

