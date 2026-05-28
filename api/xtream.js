// api/xtream.js — Vercel Serverless Function
// XtreamCodes sunucusuna proxy olarak hizmet verir
// CORS sorununu bu şekilde çözüyoruz:
// Tarayıcı → /api/xtream/* → Bu fonksiyon → panelim.veryplayer.site/HxZSfuzV/*

const XTREAM_BASE = 'http://panelim.veryplayer.site/HxZSfuzV';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Build the target URL
  // /api/xtream/player_api.php?username=X&password=Y
  // → http://panelim.veryplayer.site/HxZSfuzV/player_api.php?username=X&password=Y
  const { url } = req;
  const path = url.replace(/^\/api\/xtream/, '');
  const targetUrl = `${XTREAM_BASE}${path}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IzlelanProxy/1.0)',
        'Accept': 'application/json, */*',
      },
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();

    res.setHeader('Content-Type', contentType);
    res.status(upstream.status).send(body);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({
      error: 'Proxy bağlantı hatası',
      message: err.message,
      target: targetUrl,
    });
  }
}
