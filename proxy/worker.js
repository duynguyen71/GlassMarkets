export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url)
      const path = url.pathname
      let target = null
      if (path.startsWith('/cg/')) target = new URL('https://api.coingecko.com' + path.replace('/cg', ''))
      else if (path.startsWith('/fng/')) target = new URL('https://api.alternative.me' + path.replace('/fng', ''))
      else if (path.startsWith('/stooq/')) target = new URL('https://stooq.com' + path.replace('/stooq', ''))
      else if (path.startsWith('/okx/')) target = new URL('https://www.okx.com' + path.replace('/okx', ''))
      else if (path.startsWith('/bn/')) target = new URL('https://api.binance.com' + path.replace('/bn', ''))
      else return new Response('Not found', { status: 404 })

      // preserve query
      target.search = url.search

      const headers = new Headers(request.headers)
      headers.delete('host')
      headers.set('origin', target.origin)

      const init = {
        method: request.method,
        headers,
        body: ['GET','HEAD'].includes(request.method) ? null : await request.clone().arrayBuffer(),
      }

      const resp = await fetch(target.toString(), init)
      const outHeaders = new Headers(resp.headers)
      outHeaders.set('Access-Control-Allow-Origin', '*')
      outHeaders.set('Access-Control-Allow-Headers', '*')
      outHeaders.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS')
      return new Response(resp.body, { status: resp.status, headers: outHeaders })
    } catch (e) {
      return new Response('Proxy error: ' + (e?.message || e), { status: 502 })
    }
  }
}

