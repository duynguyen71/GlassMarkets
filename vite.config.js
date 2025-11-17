import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/_fng': {
        target: 'https://api.alternative.me',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/_fng/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/_okx': {
        target: 'https://www.okx.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/_okx/, ''),
      },
      '/_bn': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/_bn/, ''),
      },
      '/_bnf': {
        target: 'https://fapi.binance.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/_bnf/, ''),
      },
      '/_cg': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/_cg/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/_stooq': {
        target: 'https://stooq.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/_stooq/, ''),
      },
    },
  },
})
