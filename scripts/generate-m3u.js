#!/usr/bin/env node
/**
 * izlelan M3U8 Stream Generator
 * ==============================
 * TMDB'den film ve dizi listesi alır,
 * her biri için gerçek M3U8 stream URL'i bulmaya çalışır.
 *
 * Kullanım:
 *   node scripts/generate-m3u.js          → filmler + diziler, tüm kategoriler
 *   node scripts/generate-m3u.js movies   → sadece filmler
 *   node scripts/generate-m3u.js tv       → sadece diziler
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────
// AYARLAR
// ─────────────────────────────────────────
const TMDB_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const PAGES_PER_GENRE = 3;   // Her kategori için kaç sayfa (20 içerik/sayfa)
const DELAY_MS = 350;        // İstekler arası bekleme (rate limit)
const TIMEOUT_MS = 8000;

// ─────────────────────────────────────────
// TMDB KATEGORİLER
// ─────────────────────────────────────────
const MOVIE_GENRES = [
  { id: 28,    name: 'Aksiyon' },
  { id: 12,    name: 'Macera' },
  { id: 35,    name: 'Komedi' },
  { id: 18,    name: 'Dram' },
  { id: 27,    name: 'Korku' },
  { id: 878,   name: 'Bilim Kurgu' },
  { id: 10749, name: 'Romantik' },
  { id: 53,    name: 'Gerilim' },
  { id: 80,    name: 'Suc' },
  { id: 16,    name: 'Animasyon' },
  { id: 14,    name: 'Fantezi' },
  { id: 36,    name: 'Tarih' },
  { id: 10752, name: 'Savas' },
  { id: 37,    name: 'Kovboy' },
  { id: 9648,  name: 'Gizem' },
  { id: 10402, name: 'Muzik' },
  { id: 10770, name: 'TV Film' },
];

const TV_GENRES = [
  { id: 10759, name: 'Aksiyon Macera' },
  { id: 35,    name: 'Komedi' },
  { id: 18,    name: 'Dram' },
  { id: 10765, name: 'Bilim Kurgu Fantezi' },
  { id: 80,    name: 'Suc' },
  { id: 16,    name: 'Anime' },
  { id: 10768, name: 'Savas Siyaset' },
  { id: 10767, name: 'Talk Show' },
  { id: 99,    name: 'Belgesel' },
  { id: 10764, name: 'Reality' },
  { id: 10763, name: 'Haber' },
  { id: 10762, name: 'Cocuklar' },
  { id: 9648,  name: 'Gizem' },
];

// ─────────────────────────────────────────
// STREAM KAYNAKLARI (sırayla denenecek)
// ─────────────────────────────────────────

/**
 * Kaynak 1: moviesapi.club — JSON API, bazen doğrudan m3u8 döndürür
 */
async function tryMoviesApiClub(tmdbId, type) {
  try {
    const url = type === 'movie'
      ? `https://moviesapi.club/movie/${tmdbId}`
      : `https://moviesapi.club/tv/${tmdbId}-1-1`;
    const res = await axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://moviesapi.club/' },
    });
    // m3u8 URL'i HTML'den çek
    const match = res.data.match(/file:\s*["']([^"']+\.m3u8[^"']*)/);
    if (match) return match[1];
    // JSON file field
    const jsonMatch = res.data.match(/"file"\s*:\s*"([^"]+\.m3u8[^"]*)"/);
    if (jsonMatch) return jsonMatch[1];
  } catch { /* devam */ }
  return null;
}

/**
 * Kaynak 2: vidsrc.xyz embed — HLS URL'i çek
 */
async function tryVidsrcXyz(tmdbId, type, imdbId) {
  try {
    const searchId = imdbId || tmdbId;
    const url = type === 'movie'
      ? `https://vidsrc.xyz/embed/movie/${searchId}`
      : `https://vidsrc.xyz/embed/tv/${searchId}/1/1`;
    const res = await axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://vidsrc.xyz/' },
    });
    const match = res.data.match(/["']([^"']+\.m3u8[^"']*)/);
    if (match) return match[1];
  } catch { /* devam */ }
  return null;
}

/**
 * Kaynak 3: superembed.stream API
 */
async function trySuperEmbed(tmdbId, type) {
  try {
    const url = `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1${type === 'tv' ? '&s=1&e=1' : ''}`;
    const res = await axios.get(url, {
      timeout: TIMEOUT_MS,
      maxRedirects: 5,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const match = res.data.match(/["']([^"']+\.m3u8[^"']*)/);
    if (match) return match[1];
  } catch { /* devam */ }
  return null;
}

/**
 * Kaynak 4: autoembed.cc API
 */
async function tryAutoEmbed(tmdbId, type) {
  try {
    const url = type === 'movie'
      ? `https://autoembed.cc/movie/tmdb/${tmdbId}`
      : `https://autoembed.cc/tv/tmdb/${tmdbId}-1-1`;
    const res = await axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://autoembed.cc/' },
    });
    const match = res.data.match(/["']([^"']+\.m3u8[^"']*)/);
    if (match) return match[1];
  } catch { /* devam */ }
  return null;
}

/**
 * Kaynak 5: vidsrc.to embed URL (m3u8 değil ama IPTV Smarters destekler)
 */
function getFallbackEmbedUrl(tmdbId, imdbId, type) {
  const id = imdbId || tmdbId;
  if (type === 'movie') {
    return `https://vidsrc.to/embed/movie/${id}`;
  }
  return `https://vidsrc.to/embed/tv/${id}/1/1`;
}

// ─────────────────────────────────────────
// TMDB YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────

async function tmdbGet(endpoint, params = {}) {
  const res = await axios.get(`${TMDB_BASE}${endpoint}`, {
    params: { api_key: TMDB_KEY, language: 'tr-TR', ...params },
    timeout: TIMEOUT_MS,
  });
  return res.data;
}

async function getImdbId(tmdbId, type) {
  try {
    const endpoint = type === 'movie' ? `/movie/${tmdbId}/external_ids` : `/tv/${tmdbId}/external_ids`;
    const data = await tmdbGet(endpoint);
    return data.imdb_id || null;
  } catch { return null; }
}

async function discoverByGenre(genreId, type, page = 1) {
  return tmdbGet(`/discover/${type}`, {
    with_genres: genreId,
    sort_by: 'popularity.desc',
    page,
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─────────────────────────────────────────
// STREAM BULMA — tüm kaynakları dene
// ─────────────────────────────────────────

async function findStream(tmdbId, imdbId, type) {
  const sources = [
    () => tryMoviesApiClub(tmdbId, type),
    () => tryVidsrcXyz(tmdbId, type, imdbId),
    () => tryAutoEmbed(tmdbId, type),
    () => trySuperEmbed(tmdbId, type),
  ];

  for (const source of sources) {
    const url = await source();
    if (url && url.startsWith('http')) {
      return { url, isM3U8: url.includes('.m3u8') };
    }
  }

  // Hiçbiri çalışmadı — embed fallback
  return {
    url: getFallbackEmbedUrl(tmdbId, imdbId, type),
    isM3U8: false,
  };
}

// ─────────────────────────────────────────
// M3U SATIRI OLUŞTUR
// ─────────────────────────────────────────

function buildM3UEntry(item, type, categoryName, streamUrl, isM3U8) {
  const title = (item.title || item.name || 'Bilinmeyen').replace(/,/g, ' ');
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const poster = item.poster_path ? `${IMG_BASE}${item.poster_path}` : '';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
  const overview = (item.overview || '').replace(/[\r\n]/g, ' ').slice(0, 200);
  const flag = isM3U8 ? '[HLS]' : '[EMB]';

  return [
    `#EXTINF:-1 tvg-id="tmdb-${item.id}" tvg-name="${title}" tvg-logo="${poster}" tvg-year="${year}" tvg-rating="${rating}" tvg-plot="${overview}" group-title="${categoryName}",${flag} ${title}${year ? ` (${year})` : ''}`,
    streamUrl,
  ].join('\n');
}

// ─────────────────────────────────────────
// ANA İŞLEM
// ─────────────────────────────────────────

async function processGenre(genre, type, allEntries, stats) {
  console.log(`\n  📂 [${type.toUpperCase()}] ${genre.name} işleniyor...`);
  const seenIds = new Set();

  for (let page = 1; page <= PAGES_PER_GENRE; page++) {
    let data;
    try {
      data = await discoverByGenre(genre.id, type, page);
    } catch (e) {
      console.error(`    ❌ Sayfa ${page} alınamadı: ${e.message}`);
      break;
    }

    const items = data.results || [];
    if (items.length === 0) break;

    for (const item of items) {
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);

      const title = item.title || item.name || '?';
      process.stdout.write(`    🔍 ${title.slice(0, 40).padEnd(40)} `);

      // IMDB ID al
      let imdbId = null;
      try {
        imdbId = await getImdbId(item.id, type);
        await sleep(100);
      } catch { /* devam */ }

      // Stream bul
      const { url, isM3U8 } = await findStream(item.id, imdbId, type);

      const flag = isM3U8 ? '✅ M3U8' : '⚠️  EMB';
      console.log(flag);

      if (isM3U8) stats.m3u8++;
      else stats.embed++;
      stats.total++;

      allEntries.push(buildM3UEntry(item, type, genre.name, url, isM3U8));
      await sleep(DELAY_MS);
    }
  }
}

async function main() {
  const arg = process.argv[2] || 'all';
  const doMovies = arg === 'all' || arg === 'movies';
  const doTV = arg === 'all' || arg === 'tv';

  // Output klasörü oluştur
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║       izlelan M3U8 Stream Generator              ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`Mod: ${arg} | Kategori başına ${PAGES_PER_GENRE} sayfa (${PAGES_PER_GENRE * 20} içerik)\n`);

  const startTime = Date.now();
  const allEntries = ['#EXTM3U x-tvg-url=""'];
  const stats = { total: 0, m3u8: 0, embed: 0 };

  if (doMovies) {
    console.log('🎬 FİLMLER işleniyor...');
    for (const genre of MOVIE_GENRES) {
      await processGenre(genre, 'movie', allEntries, stats);
    }
  }

  if (doTV) {
    console.log('\n📺 DİZİLER işleniyor...');
    for (const genre of TV_GENRES) {
      await processGenre(genre, 'tv', allEntries, stats);
    }
  }

  // Dosyaya yaz
  const ts = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
  const filename = `izlelan_${arg}_${ts}.m3u`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, allEntries.join('\n\n'));

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║                    TAMAMLANDI                     ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`📊 Toplam işlenen  : ${stats.total} içerik`);
  console.log(`✅ Gerçek M3U8     : ${stats.m3u8} (${((stats.m3u8 / stats.total) * 100).toFixed(1)}%)`);
  console.log(`⚠️  Embed fallback  : ${stats.embed}`);
  console.log(`⏱️  Süre           : ${elapsed} dakika`);
  console.log(`📁 Çıktı dosyası   : ${outputPath}`);
  console.log('\n💡 İPUCU: M3U dosyasını IPTV panelinize şu şekilde import edin:');
  console.log('   veryplayer.site → Playlist ekle → M3U URL / Dosya yükle');
}

main().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
