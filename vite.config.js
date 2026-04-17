import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CampslaY',
        short_name: 'CampslaY',
        description: 'Tesla Model Y 캠핑 패킹 어시스턴트',
        theme_color: '#1c1917',
        background_color: '#f5f5f4',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
