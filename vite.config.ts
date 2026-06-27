import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest.json';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        analyze: resolve(__dirname, 'src/analyze/analyze.html'),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      port: 5173,
    },
  },
});
