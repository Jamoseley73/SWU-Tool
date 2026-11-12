import { defineConfig } from 'vite';

export default defineConfig({
  // './' makes every link relative, so the site works at
  // https://jamoseley73.github.io/SWU-Tool/ without hard-coding the repo name.
  base: './',
  // Copy everything in ../data into the built site as-is,
  // so the page can fetch e.g. './suspensions.json'.
  publicDir: '../data',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
