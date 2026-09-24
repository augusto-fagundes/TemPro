import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    /* Playwright and CI start Vite as a child process — opening a browser
       tab on every run is noise, not help. */
    open: process.env.PW_TEST !== '1' && !process.env.CI,
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
});
