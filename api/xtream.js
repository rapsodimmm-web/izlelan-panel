// api/xtream.js — Vercel Serverless Function
// Tüm /api/xtream/* isteklerini panelim.veryplayer.site/HxZSfuzV/*'a proxy'ler
// CORS sorununu bu şekilde çözüyoruz

const XTREAM_BASE = 'http://panelim.veryplayer.site/HxZSfuzV';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // /api/xtream/player_api.php?... → /HxZSfuzV/player_api.php?...
  // /api/xtream/movie/user/pass/123.mkv → /HxZSfuzV/movie/user/pass/123.mkv
  const fullUrl = req.url; // e.g. /api/xtream/player_api.php?username=x&password=y
  
  // Strip /api/xtream prefix — everything after becomes the path
  const pathAfterProxy = fullUrl.replace(/^\/api\/xtream/, '') || '/player_api.php';
  const targetUrl = `${XTREAM_BASE}${pathAfterProxy}`;

  console.log(`[PROXY] ${req.method} ${targetUrl}`);

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IzlelanProxy/2.0)',
        'Accept': 'application/json, */*',
      },
      // Forward body for POST requests
      ...(req.method === 'POST' ? { body: JSON.stringify(req.body) } : {}),
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(upstream.status).send(body);
  } catch (err) {
    console.error('[PROXY ERROR]', err.message, '→', targetUrl);
    return res.status(502).json({
      error: 'Proxy bağlantı hatası',
      message: err.message,
      target: targetUrl,
    });
  }
}
