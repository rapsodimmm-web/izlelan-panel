import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Dev'de: /api/xtream/* → panelim.veryplayer.site/HxZSfuzV/*
      '/api/xtream': {
        target: 'http://panelim.veryplayer.site',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/xtream/, '/HxZSfuzV'),
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'lucide-react'],
  },
})
