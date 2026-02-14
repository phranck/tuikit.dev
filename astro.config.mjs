import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://tuikit.dev',
  output: 'static',
  integrations: [
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      // Fallback version - matches current latest TUIkit release
      'import.meta.env.PUBLIC_TUIKIT_VERSION': JSON.stringify(process.env.TUIKIT_VERSION ?? '0.3.0'),
    },
  },
});
