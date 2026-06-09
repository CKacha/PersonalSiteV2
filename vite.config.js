import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';

let commitHash = 'unknown';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch { /* not a git repo or git not available */ }

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    __COMMIT__: JSON.stringify(commitHash)
  }
});
