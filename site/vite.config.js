import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // './' makes every link relative, so the site works at
  // https://jamoseley73.github.io/SWU-Tool/ without hard-coding the repo name.
  base: './',
  // Copy everything in ../data into the built site as-is,
  // so pages can fetch e.g. './config.json' or './sample/answer_grids.json'.
  publicDir: '../data',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022', // allows top-level await in page scripts
    // One entry per page.
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        answerGrid: resolve(import.meta.dirname, 'answer-grid.html'),
      },
    },
  },
});
