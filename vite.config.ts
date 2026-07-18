/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages sirve la app bajo /AuraInventory/
export default defineConfig({
  base: '/AuraInventory/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Aura Inventory',
        short_name: 'Aura',
        description: 'Tu inventario personal, hermoso y offline.',
        lang: 'es',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#fafafa',
        theme_color: '#7c5cf5',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // offline total: shell + assets precacheados; los datos ya viven en IndexedDB
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/AuraInventory/index.html',
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
