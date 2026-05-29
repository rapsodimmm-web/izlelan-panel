// api/play.js — Özel Sinema Yayın Çözücü API (Stream Resolver)
// Bu API, Televizo ve Hot Player gibi IPTV oynatıcıları doğrudan çalışan akış linklerine yönlendirir.
// Kullanım: 
// Film İçin:  https://izlelan-clone.vercel.app/api/play?id=TMDB_ID
// Dizi İçin:  https://izlelan-clone.vercel.app/api/play?id=TMDB_ID&type=series&s=1&e=1

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, type = 'movie', s = 1, e = 1 } = req.query;

  // TMDB ID kontrolü
  if (!id) {
    return res.status(400).json({ error: 'Eksik TMDB ID parametresi (id gereklidir)' });
  }

  console.log(`[STREAM RESOLVER] → ID: ${id}, Tip: ${type}, Sezon: ${s}, Bölüm: ${e}`);

  try {
    let targetStreamUrl = '';

    // Televizo ve harici oynatıcılara en uyumlu, hızlı ve doğrudan akış veren kaynak
    if (type === 'movie' || type === 'vod') {
      targetStreamUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;
    } else {
      targetStreamUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`;
    }

    // IPTV oynatıcıları (Televizo, VLC, Hot Player vb.) HTTP 302 yönlendirmesini takip edebilir
    res.writeHead(302, { 
      'Location': targetStreamUrl,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });
    return res.end();
  } catch (err) {
    console.error('[STREAM RESOLVER ERR]', err.message);
    return res.status(502).json({ error: 'Yayın linki çözülemedi', message: err.message });
  }
}
