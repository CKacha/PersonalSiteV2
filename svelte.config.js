import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base =
  process.env.BASE_PATH ??
  (process.env.NODE_ENV === 'production' ? '/PersonalSiteV2' : '');

const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: false
    }),

    paths: {
      base
    },

    prerender: {
      entries: ['*'],
      handleHttpError: 'warn',
      handleMissingId: 'warn'
    }
  }
};

export default config;
