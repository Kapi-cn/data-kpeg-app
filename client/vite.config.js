import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import solidPlugin from 'vite-plugin-solid';

import UnoCSS from 'unocss/vite';

export default defineConfig({
  plugins: [solid(), UnoCSS(), solidPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
