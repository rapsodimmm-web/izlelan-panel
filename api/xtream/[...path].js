// api/xtream/[...path].js — Vercel Serverless Function (Catch-all route)
// /api/xtream/player_api.php?... → panelim.veryplayer.site/HxZSfuzV/player_api.php?...
// /api/xtream/movie/user/pass/id.mkv → panelim.veryplayer.site/HxZSfuzV/movie/...

const XTREAM_BASE = 'http://panelim.veryplayer.site/HxZSfuzV';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // req.query.path = ['player_api.php'] or ['movie', 'user', 'pass', '123.mkv']
  const pathParts = req.query.path || [];
  const subPath = Array.isArray(pathParts) ? pathParts.join('/') : pathParts;

  // Query string'i yeniden oluştur (path dışındakiler)
  const { path: _p, ...restQuery } = req.query;
  const qs = new URLSearchParams(restQuery).toString();

  const targetUrl = `${XTREAM_BASE}/${subPath}${qs ? '?' + qs : ''}`;
  console.log(`[PROXY] → ${targetUrl}`);

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IzlelanProxy/2.0)',
        'Accept': 'application/json, */*',
      },
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(upstream.status).send(body);
  } catch (err) {
    console.error('[PROXY ERR]', err.message);
    return res.status(502).json({ error: err.message, target: targetUrl });
  }
}
