import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/_fng': {
        target: 'https://api.alternative.me',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_fng/, ''),
      },
      '/_okx': {
        target: 'https://www.okx.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_okx/, ''),
      },
      '/_bn': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_bn/, ''),
      },
      '/_cg': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_cg/, ''),
      },
      '/_stooq': {
        target: 'https://stooq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_stooq/, ''),
      },
    },
  },
})
