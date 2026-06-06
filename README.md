# PersonalSiteV2

A remade personal site! The V2 version.

The old one uh... wasn't good. Now I've got a better one!

---

## Stack

- [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- [Vite 5](https://vitejs.dev/)
- [`@sveltejs/adapter-static`](https://kit.svelte.dev/docs/adapter-static) — site is fully prerendered to static HTML
- [Firebase Firestore](https://firebase.google.com/docs/firestore) for the `/logbook` guestbook

```
src/
  app.html                 # SvelteKit document template
  routes/
    +layout.svelte         # global layout / CSS
    +page.svelte           # home page (boot animation, ticker, status box)
    projects/+page.svelte  # GitHub repos + art grid
    logbook/+page.svelte   # Firestore-backed guestbook
    blog/+page.svelte      # stub
  lib/
    firebase.ts            # lazy Firestore client
    components/
      Topbar.svelte
      StatusBox.svelte
static/                    # static assets copied as-is
```

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # produces ./build (static site)
npm run preview      # serves ./build locally
```

For a local build that matches the GitHub Pages base path:

```bash
# PowerShell
$env:BASE_PATH = "/PersonalSiteV2"; npm run build; npm run preview

# bash / zsh
BASE_PATH=/PersonalSiteV2 npm run build && npm run preview
```

## Firebase

`src/lib/firebase.ts` is intentionally empty by default. The Firestore client is
only created if `apiKey` and `projectId` are filled in, so prerender / preview
builds work without credentials. The `/logbook` page silently no-ops on submit
until Firebase is configured.

To enable it, paste your config object into `src/lib/firebase.ts` and add a
Firestore security rule that allows writes to the `guestbook` collection.

## Test deployment (GitHub Pages)

A GitHub Actions workflow at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds the site
and publishes it to GitHub Pages.

**One-time setup:**

1. Push this repo to GitHub (already done: `github.com/CKacha/PersonalSiteV2`).
2. In the repo on GitHub: **Settings → Pages → Build and deployment → Source**
   = **GitHub Actions**.
3. Make sure **Settings → Actions → General → Workflow permissions** allows
   "Read and write permissions" (needed for the `pages: write` permission).

**Deploying:**

- Push to `main` → workflow runs automatically and publishes to
  `https://ckacha.github.io/PersonalSiteV2/`.
- For a manual test deploy from any branch: go to the repo's **Actions** tab →
  "Deploy to GitHub Pages" → **Run workflow**.

The workflow injects `BASE_PATH=/PersonalSiteV2` (derived from the repo name) so
asset URLs resolve correctly under the project subpath. Rename the repo and the
base path follows automatically.
