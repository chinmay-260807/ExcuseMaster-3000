
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Specifically target the API_KEY for replacement during build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
