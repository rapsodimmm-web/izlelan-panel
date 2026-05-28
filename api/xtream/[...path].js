// api/xtream/[...path].js — Vercel Catch-all Proxy
// /api/xtream/player_api.php?... → http://91.229.239.102/player_api.php?...
// /api/xtream/movie/user/pass/id.mkv → http://91.229.239.102/movie/user/pass/id.mkv

const XTREAM_BASE = 'http://91.229.239.102';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // path array'i birleştir: ['player_api.php'] → 'player_api.php'
  const pathParts = req.query.path || [];
  const subPath = Array.isArray(pathParts) ? pathParts.join('/') : String(pathParts);

  // Diğer query param'larını koru (path dışındakiler)
  const { path: _p, ...restQuery } = req.query;
  const qs = new URLSearchParams(restQuery).toString();

  // Çift slash'ı önle
  const targetUrl = `${XTREAM_BASE}/${subPath}${qs ? '?' + qs : ''}`;
  console.log(`[PROXY] → ${targetUrl}`);

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
