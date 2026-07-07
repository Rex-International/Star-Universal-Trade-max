import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Star-Universal-Trade-max/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
