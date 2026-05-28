// api/xtream.js — Vercel Serverless Proxy
// XtreamCodes API'ye CORS sorunsuz erişim sağlar
// Kullanım: /api/xtream?username=X&password=Y&action=Z&...

const XTREAM_API = 'https://panelim.veryplayer.site/player_api.php';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // req.query içindeki tüm parametreleri XtreamCodes API'ye ilet
  const params = new URLSearchParams(req.query).toString();
  const targetUrl = `${XTREAM_API}?${params}`;

  console.log(`[XTREAM PROXY] → ${targetUrl}`);

  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IzlelanProxy/4.0)',
        'Accept': 'application/json, */*',
      },
      signal: AbortSignal.timeout(15000),
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(upstream.status).send(body);
  } catch (err) {
    console.error('[XTREAM PROXY ERR]', err.message);
    return res.status(502).json({ error: err.message, target: targetUrl });
  }
}
