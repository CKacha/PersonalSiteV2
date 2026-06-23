<script lang="ts">
    import { onMount } from 'svelte';
    import Topbar from '../lib/components/Topbar.svelte';
    import StatusBox from '../lib/components/StatusBox.svelte';

    let bootVisible = true;
    let flashGo = false;
    let revealGo = false;
    let bootText = '';
    let helloText = '';
    let helloDone = false;

    const socials = [
        { type: 'link', label: 'github', href: 'https://github.com/Ckacha'},
        { type: 'text', label: 'slack', href: "https://hackclub.slack.com/team/U0828FYS2UC"},
        { type: 'text', label: 'email', href: "me@ckacha.dev"},
    ];

    function wait(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async function runBoot() {
        const lines: string[] = []

        let charDelay = 35;
        let linePause = 350;
        let reduce = false;

        try {
        reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch {
        reduce = false;
        }

        if (reduce) {
        charDelay = 0;
        linePause = 120;
        }

        for (let li = 0; li < lines.length; li++) {
            const text = lines[li];
            if (li > 0) bootText += '\n';

            for (let ci = 0; ci < text.length; ci++) {
                bootText += text.charAt(ci);
                if (charDelay) await wait(charDelay);
            }

            await wait(linePause);
        }

        bootVisible = false;

        if (!reduce) {
            flashGo = true;
            await wait(110);
            revealGo = true;
            await wait(490);
        }

        flashGo = false;
        revealGo = false;

        await typeHello(reduce ? 0 : 45);
    }

    async function typeHello(delay: number) {
        const text = "Hi, I'm Ckacha";
        for (let i = 0; i < text.length; i++) {
            helloText += text.charAt(i);
            if (delay) await wait(delay);
        }
        helloDone = true;
    }

    onMount(() => {
        runBoot();
    });
</script>

<svelte:head>
    <title>Home | Ckacha </title>
</svelte:head>

{#if bootVisible}
  <div id="boot" class="boot">
    <pre id="boot-lines" class="boot-lines">{bootText}</pre>
  </div>
{/if}

<div class:flash={true} class:flash--go={flashGo} aria-hidden="true"></div>
<div class:reveal={true} class:reveal--go={revealGo} aria-hidden="true">
  <div class="bar bar-left"></div>
  <div class="bar bar-right"></div>
</div>

<Topbar />

<main class="wrap">
  <h1 class:type-caret={!helloDone}>{helloText}</h1>
  <p>I'm currently a high school student that makes things</p>

  <section aria-label="my socials" class="ticker b-solid">
    <div class="ticker-head">my socials</div>

    <div class="ticker-viewport">
      <div class="ticker-track">
        {#each socials as item, i}
          <span class="item">
            {#if item.type === 'link'}
              <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
            {:else}
              {item.label}
            {/if}
          </span>
          {#if i < socials.length - 1}
            <span class="sep">•</span>
          {/if}
        {/each}
      </div>

      <div class="ticker-track" aria-hidden="true">
        {#each socials as item, i}
          <span class="item">
            {#if item.type === 'link'}
              <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
            {:else}
              {item.label}
            {/if}
          </span>
          {#if i < socials.length - 1}
            <span class="sep">•</span>
          {/if}
        {/each}
      </div>
    </div>
  </section>
</main>

<section style="margin-block-end: clamp(3rem, 8vh, 10rem);"></section>

<StatusBox
  label="Now Playing"
  value="lo-fi study loop"
  mode="bounce"
  storageKey="statusbox-now"
/>

<footer class="site-footer">made with svelte, I need some coffee &nbsp;·&nbsp; <span class="version">v{__COMMIT__}</span></footer>



