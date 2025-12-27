import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/iatf-cara-assistant-pro-1.0/',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react()
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['icons/*.png', 'icons/*.svg'],
    //   manifest: {
    //     name: 'IATF CARA Assistant Pro',
    //     short_name: 'IATF CARA',
    //     description: 'IATF 16949审核不符合项管理工具',
    //     theme_color: '#00a65a',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     icons: [
    //       {
    //         src: '/iatf-cara-pro-1.0/icons/icon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/iatf-cara-pro-1.0/icons/icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/esm\.sh\/.*$/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'esm-cache',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
    //           }
    //         }
    //       }
    //     ]
    //   }
    // })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@config': path.resolve(__dirname, './src/config')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [
        '@google/genai',
        '@anthropic-ai/sdk',
        'openai'
      ]
    }
  }
});
