GlassMarkets — Crypto Dashboard (OKX/Binance)

Overview
- React + Vite app using Chakra UI to display a live crypto market dashboard.
- Uses OKX free public REST to load initial SPOT tickers, then WebSocket for live updates on top pairs.
- Focuses on USDT pairs for consistent quote currency metrics.

Getting Started
1) Install dependencies
   - npm install

2) Run in development
   - npm run dev
   - Open the printed local URL (default http://localhost:5173)

3) Build for production
   - npm run build
   - npm run preview

Notes
- Data source: https://www.okx.com/ (REST: /api/v5/market/tickers?instType=SPOT, WS: wss://ws.okx.com:8443/ws/v5/public).
- The app filters to USDT pairs, sorts by 24h quote volume, subscribes to the top 40 tickers for live updates.
- If your browser/network blocks the requests (CORS, firewall), you may need to run behind a local proxy or allowlist okx.com.

Switching to Binance (optional)
- This project is structured so a Binance provider can be added (REST: /api/v3/ticker/24hr, WS: wss://stream.binance.com:9443).
- If you want, open an issue or ask and I’ll add a `binance.js` provider and toggle.

Tech Stack
- React 18, Vite 5, Chakra UI 2, Axios
# GlassMarkets
