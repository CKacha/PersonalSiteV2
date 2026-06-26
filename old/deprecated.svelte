// place to put old code that I didn't want to delete but also don't want to use
// lowkey just gonna shove everything in here

// initial boot animation from old main page

<script lang="ts">
    import { onMount } from 'svelte';

    let bootVisible = true;
    let flashGo = false;
    let revealGo = false;
    let bootText = '';
    let helloText = '';
    let helloDone = false;

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

<h1 class:type-caret={!helloDone}>{helloText}</h1>
