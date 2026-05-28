// api/xtream/[...path].js — Vercel Catch-all Proxy
// Tüm /api/xtream/* isteklerini XtreamCodes sunucusuna yönlendirir

const XTREAM_BASE = 'http://91.229.239.102';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // req.url = '/api/xtream/player_api.php?username=x&password=y&action=z'
  // Hedef: 'http://91.229.239.102/player_api.php?username=x&password=y&action=z'
  const originalUrl = req.url || '';
  
  // /api/xtream/ prefix'ini kaldır
  const withoutPrefix = originalUrl.replace(/^\/api\/xtream\/?/, '');
  const targetUrl = `${XTREAM_BASE}/${withoutPrefix}`;

  console.log(`[PROXY] ${req.method} ${originalUrl} → ${targetUrl}`);

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IzlelanProxy/3.0)',
        'Accept': 'application/json, */*',
      },
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(upstream.status).send(body);
  } catch (err) {
    console.error('[PROXY ERR]', err.message, '→', targetUrl);
    return res.status(502).json({ error: err.message, target: targetUrl });
  }
}
