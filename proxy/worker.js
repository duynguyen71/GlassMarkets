const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
}

function buildTarget(path) {
  if (path.startsWith('/cg/')) return new URL('https://api.coingecko.com' + path.replace('/cg', ''))
  if (path.startsWith('/fng/')) return new URL('https://api.alternative.me' + path.replace('/fng', ''))
  if (path.startsWith('/stooq/')) return new URL('https://stooq.com' + path.replace('/stooq', ''))
  if (path.startsWith('/okx/')) return new URL('https://www.okx.com' + path.replace('/okx', ''))
  if (path.startsWith('/bn/')) return new URL('https://api.binance.com' + path.replace('/bn', ''))
  return null
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const target = buildTarget(path)
    if (!target) {
      return new Response('Not found', { status: 404, headers: CORS_HEADERS })
    }

    try {
      target.search = url.search
      const headers = new Headers(request.headers)
      headers.delete('host')
      headers.set('origin', target.origin)
      const init = {
        method: request.method,
        headers,
        body: ['GET', 'HEAD'].includes(request.method) ? null : await request.clone().arrayBuffer(),
      }
      const resp = await fetch(target.toString(), init)
      const outHeaders = new Headers(resp.headers)
      Object.entries(CORS_HEADERS).forEach(([k, v]) => outHeaders.set(k, v))
      return new Response(resp.body, { status: resp.status, headers: outHeaders })
    } catch (e) {
      return new Response('Proxy error: ' + (e?.message || e), { status: 502, headers: CORS_HEADERS })
    }
  },
}
