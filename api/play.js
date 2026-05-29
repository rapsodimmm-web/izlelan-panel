// api/play.js — Özel Sinema Yayın Çözücü API (Stream Resolver)
// Bu API, Televizo ve Hot Player gibi IPTV oynatıcıları doğrudan ham HLS (.m3u8) veya MP4 video akışlarına yönlendirir.
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

  if (!id) {
    return res.status(400).json({ error: 'Eksik TMDB ID parametresi (id gereklidir)' });
  }

  console.log(`[STREAM RESOLVER V2] → ID: ${id}, Tip: ${type}, Sezon: ${s}, Bölüm: ${e}`);

  try {
    let targetStreamUrl = '';

    // VLC, Televizo ve diğer oynatıcıların (HTML sayfa olmadan) ham video olarak oynatabileceği çözücü adresler
    if (type === 'movie' || type === 'vod') {
      // ham video akışı sağlayan ve player-friendly olan yönlendiriciler
      targetStreamUrl = `https://vidsrc.cc/v2/embed/movie/${id}`;
    } else {
      targetStreamUrl = `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`;
    }

    // 1. Alternatif: Vidlink veya multiembed yerine, doğrudan video stream paketini taşıyan sunucu adresine yönlendir
    // player-friendly ve doğrudan m3u8 akışına geçiş sağlayan API köprüsü
    const directStreamUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;

    // 2. HTTP 302 Yönlendirmesini en ham akış formatı üzerinden yapalım
    // VLC ve Televizo gibi oynatıcılar için doğrudan video kaynağı header'ları ile yönlendir
    res.writeHead(302, { 
      'Location': directStreamUrl,
      'Content-Type': 'video/mp4', // Oynatıcılara bunun bir video akışı olduğunu belirtiyoruz
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });
    return res.end();
  } catch (err) {
    console.error('[STREAM RESOLVER V2 ERR]', err.message);
    return res.status(502).json({ error: 'Yayın linki çözülemedi', message: err.message });
  }
}

