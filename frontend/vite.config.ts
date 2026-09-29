import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'SCJE Student Hub',
        short_name: 'SCJE Hub',
        description:
          'Events, announcements and academic information for BSCRIM and BSISM students.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#380711',
        theme_color: '#380711',
        icons: [
          { src: 'icons/Icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/Icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/Icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/Icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,webmanifest}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // The shell is precached, so every deep link still resolves offline.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Reads only: the backend may sit on another origin, so the pattern
            // is written against the full URL rather than the path.
            urlPattern: /^https?:\/\/[^/]+\/api\//,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'scje-api-v1',
              // A local API answers immediately; waiting longer only makes a
              // dead server feel like a hung app.
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              // Never cache a 401 or an error body - offline should replay the
              // last good answer, not a rejection.
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      devOptions: {
        // Registers the worker and serves the manifest during `npm run dev` so
        // the app is installable there too. Full offline behaviour (precache +
        // runtime cache) is built, so it is demoed from `npm run preview`.
        enabled: true,
      },
    }),
  ],
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: '../dist',
    // outDir sits outside the root, so Vite skips the empty step by default.
    // Without it every rebuild leaves the previous hashed bundle behind, and
    // the PWA precaches whatever is in the folder - stale files included.
    emptyOutDir: true,
  },
});
