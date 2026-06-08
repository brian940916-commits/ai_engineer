import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base MUST match the GitHub repo name so assets resolve under GitHub Pages
// (https://<user>.github.io/ai_engineer/).
export default defineConfig({
  plugins: [react()],
  base: '/ai_engineer/',
});
