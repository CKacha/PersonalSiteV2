<script lang="ts">
    import { onMount } from 'svelte';
    import Topbar from '../lib/components/Topbar.svelte';
    import { projects } from '$lib/projects';

    const socials = [
        { label: 'github', href: 'https://github.com/Ckacha' },
        { label: 'slack',  href: 'https://hackclub.slack.com/team/U0828FYS2UC' },
        { label: 'email',  href: 'mailto:me@ckacha.dev' },
    ];

    const tickerItems = Array(10).fill(socials).flat();

    let currentIndex = 0;

    onMount(() => {
        const id = setInterval(() => {
            currentIndex = (currentIndex + 1) % projects.length;
        }, 10000);
        return () => clearInterval(id);
    });
</script>

<svelte:head>
    <title>Home</title>
</svelte:head>

<Topbar />

<main class="wrap">
  <h1>Hi! I'm Ckacha</h1>
  <p>I'm a teenager that make things sometimes :p</p>
  <p>Currently my main focus is doing cool things at <a href="https://hackclub.com" target="_blank" rel="noreferrer">Hack Club</a></p>
  <p>I also like listening to music, playing Gacha Games, and writing on my <a href="https://ckacha.github.io/blawg/" target="_blank" rel="noreferrer">Blawg</a></p>
  <section aria-label="my socials" class="ticker b-solid">
    <div class="ticker-head">my socials</div>

    <div class="ticker-viewport">
      <div class="ticker-inner">
        {#each [0, 1] as _, copy}
          <div class="ticker-track" aria-hidden={copy === 1 ? 'true' : undefined}>
            {#each tickerItems as item}
              <span class="item">
                <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
              </span>
              <span class="sep">•</span>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section class="preview-section">
    <h2>some of my projects</h2>

    <div class="carousel-viewport">
      <div class="carousel-track" style="transform: translateX(-{currentIndex * 100}%)">
        {#each projects as project}
          <div class="carousel-slide">
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
          </div>
        {/each}
      </div>
    </div>

    <div class="see-more">
      <a href="/projects">see more here →</a>
    </div>
  </section>
</main>

<footer class="site-footer">made with svelte, I need some coffee &nbsp;·&nbsp; <span class="version">v{__COMMIT__}</span></footer>
