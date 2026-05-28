import { useState, useEffect, useRef } from 'react';
import { discoverByGenre, getPopularMovies, getTopRatedMovies, getPopularShows, IMG_W500 } from '../api/tmdb';
import { ChevronLeft, ChevronRight, Play, X, Star, Download, Film, Tv, List } from 'lucide-react';
import axios from 'axios';

// ===== Türkçe film/dizi türleri =====
const MOVIE_GENRES = [
  { id: 28, name: 'Aksiyon', emoji: '💥' },
  { id: 35, name: 'Komedi', emoji: '😂' },
  { id: 18, name: 'Dram', emoji: '🎭' },
  { id: 27, name: 'Korku', emoji: '👻' },
  { id: 878, name: 'Bilim Kurgu', emoji: '🚀' },
  { id: 10749, name: 'Romantik', emoji: '❤️' },
  { id: 12, name: 'Macera', emoji: '🗺️' },
  { id: 53, name: 'Gerilim', emoji: '😰' },
  { id: 16, name: 'Animasyon', emoji: '🎨' },
  { id: 80, name: 'Suç', emoji: '🔍' },
];

const TV_GENRES = [
  { id: 10759, name: 'Aksiyon & Macera', emoji: '💥' },
  { id: 35, name: 'Komedi', emoji: '😂' },
  { id: 18, name: 'Dram', emoji: '🎭' },
  { id: 10765, name: 'Bilim Kurgu & Fantezi', emoji: '🚀' },
  { id: 80, name: 'Suç', emoji: '🔍' },
  { id: 16, name: 'Anime', emoji: '🎌' },
];

const EMBED_SOURCES = {
  movie: [
    (id) => `https://vidsrc.to/embed/movie/${id}`,
    (id) => `https://www.2embed.cc/embed/${id}`,
    (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
  ],
  tv: [
    (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
    (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  ],
};

// M3U içeriği oluştur
function generateM3U(items, categoryName, type) {
  const lines = ['#EXTM3U'];
  items.forEach(item => {
    const title = item.title || item.name || 'Bilinmeyen';
    const poster = item.poster_path ? `${IMG_W500}${item.poster_path}` : '';
    const streamUrl = type === 'movie'
      ? EMBED_SOURCES.movie[0](item.id)
      : EMBED_SOURCES.tv[0](item.id, 1, 1);

    lines.push(
      `#EXTINF:-1 tvg-id="${item.id}" tvg-name="${title}" tvg-logo="${poster}" group-title="${categoryName}",${title}`,
      streamUrl
    );
  });
  return lines.join('\n');
}

// Mini oynatıcı modalı
function MiniPlayer({ item, type, onClose }) {
  const [srcIdx, setSrcIdx] = useState(0);
  const sources = EMBED_SOURCES[type] || EMBED_SOURCES.movie;
  const src = type === 'movie'
    ? sources[srcIdx](item.id)
    : sources[srcIdx](item.id, 1, 1);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div
        style={{ width: '100%', maxWidth: 1000, position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 12, gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>
              {item.title || item.name}
            </span>
            {/* Source buttons */}
            <div style={{ display: 'flex', gap: 6 }}>
              {sources.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSrcIdx(i)}
                  style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem',
                    fontWeight: 600, cursor: 'pointer',
                    background: i === srcIdx ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    color: i === srcIdx ? '#0a0a0f' : 'white',
                    border: 'none',
                  }}
                >
                  K{i + 1}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'white', cursor: 'pointer', fontSize: '1.2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Player */}
        <div style={{
          position: 'relative', paddingBottom: '56.25%', height: 0,
          borderRadius: 12, overflow: 'hidden', background: '#000',
        }}>
          <iframe
            key={`${srcIdx}-${item.id}`}
            src={src}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            title={item.title || item.name}
          />
        </div>
      </div>
    </div>
  );
}

// Yatay kaydırmalı film satırı
function CatalogRow({ genre, type, onPlay }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    discoverByGenre(genre.id, type)
      .then(r => { setItems(r.data.results.slice(0, 20)); setLoading(false); })
      .catch(() => setLoading(false));
  }, [genre.id, type]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 600, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
      }}>
        <span style={{ fontSize: '1.3rem' }}>{genre.emoji}</span>
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{genre.name}</h3>
        <span style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '2px 8px', fontSize: '0.72rem',
          color: 'var(--text-muted)',
        }}>
          {items.length} içerik
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => scroll(-1)}
          style={{
            position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.8)', border: '1px solid var(--border)',
            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={scrollRef}
          style={{
            display: 'flex', gap: 12, overflowX: 'auto',
            scrollbarWidth: 'none', paddingBottom: 4,
          }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  flexShrink: 0, width: 130, height: 195,
                  borderRadius: 10, background: 'var(--bg-card)',
                  animation: 'pulse 1.5s ease infinite',
                }} />
              ))
            : items.map(item => (
                <div
                  key={item.id}
                  onClick={() => onPlay(item, type)}
                  style={{
                    flexShrink: 0, width: 130, cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ position: 'relative' }}>
                    {item.poster_path ? (
                      <img
                        src={`${IMG_W500}${item.poster_path}`}
                        alt={item.title || item.name}
                        style={{
                          width: '100%', aspectRatio: '2/3', objectFit: 'cover',
                          borderRadius: 10, border: '1px solid var(--border)',
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{
                        width: '100%', aspectRatio: '2/3', borderRadius: 10,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center', padding: 8,
                      }}>
                        {item.title || item.name}
                      </div>
                    )}
                    {/* Play overlay */}
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: 10,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.3s ease',
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'var(--primary)', color: '#0a0a0f',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Play size={18} fill="#0a0a0f" />
                      </div>
                    </div>
                    {/* Rating */}
                    {item.vote_average > 0 && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6,
                        background: 'rgba(0,0,0,0.8)', borderRadius: 4,
                        padding: '2px 6px', fontSize: '0.68rem', fontWeight: 700,
                        color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        <Star size={9} fill="#fbbf24" stroke="none" />
                        {item.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p style={{
                    fontSize: '0.75rem', fontWeight: 600, marginTop: 6,
                    color: 'var(--text-secondary)', lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {item.title || item.name}
                  </p>
                </div>
              ))
          }
        </div>

        <button
          onClick={() => scroll(1)}
          style={{
            position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.8)', border: '1px solid var(--border)',
            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// M3U İndirme Paneli
function M3UGenerator() {
  const [contentType, setContentType] = useState('movie');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const genres = contentType === 'movie' ? MOVIE_GENRES : TV_GENRES;

  const toggleGenre = (id) => {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const generateAndDownload = async () => {
    const toProcess = selectedGenres.length > 0
      ? genres.filter(g => selectedGenres.includes(g.id))
      : genres.slice(0, 5);

    setLoading(true);
    setProgress('Veriler çekiliyor...');

    const allLines = ['#EXTM3U'];

    for (const genre of toProcess) {
      setProgress(`${genre.emoji} ${genre.name} kategorisi çekiliyor...`);
      try {
        const resp = await discoverByGenre(genre.id, contentType);
        const items = resp.data.results.slice(0, 20);
        items.forEach(item => {
          const title = item.title || item.name || 'Bilinmeyen';
          const poster = item.poster_path ? `${IMG_W500}${item.poster_path}` : '';
          const year = (item.release_date || item.first_air_date || '').slice(0, 4);
          const rating = item.vote_average?.toFixed(1) || '';
          const streamUrl = contentType === 'movie'
            ? EMBED_SOURCES.movie[0](item.id)
            : EMBED_SOURCES.tv[0](item.id, 1, 1);

          allLines.push(
            `#EXTINF:-1 tvg-id="tmdb-${item.id}" tvg-name="${title}" tvg-logo="${poster}" tvg-year="${year}" tvg-rating="${rating}" group-title="${genre.name}",${title}${year ? ` (${year})` : ''}`,
            streamUrl
          );
        });
        // Kısa bekleme (rate limit)
        await new Promise(r => setTimeout(r, 300));
      } catch {
        // Bu kategoride hata — devam et
      }
    }

    setProgress('M3U dosyası hazırlanıyor...');
    const blob = new Blob([allLines.join('\n')], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `izlelan_${contentType === 'movie' ? 'filmler' : 'diziler'}_${Date.now()}.m3u`;
    a.click();
    URL.revokeObjectURL(url);

    setLoading(false);
    setProgress('');
  };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: 24,
    }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Download size={16} color="var(--primary)" /> M3U Playlist Oluştur
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          TMDB'den kategorik film/dizi listesi oluşturun. IPTV panelinize import edebilirsiniz.
        </p>
      </div>

      {/* Content type */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ id: 'movie', label: '🎬 Filmler', icon: <Film size={14} /> }, { id: 'tv', label: '📺 Diziler', icon: <Tv size={14} /> }].map(ct => (
          <button
            key={ct.id}
            onClick={() => { setContentType(ct.id); setSelectedGenres([]); }}
            style={{
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              background: contentType === ct.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: contentType === ct.id ? '#0a0a0f' : 'var(--text-secondary)',
              border: `1px solid ${contentType === ct.id ? 'var(--primary)' : 'var(--border)'}`,
              fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {ct.label}
          </button>
        ))}
      </div>

      {/* Genre selection */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
          Kategoriler (boş bırakırsanız ilk 5 kategori eklenir):
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {genres.map(g => (
            <button
              key={g.id}
              onClick={() => toggleGenre(g.id)}
              style={{
                padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem',
                background: selectedGenres.includes(g.id) ? 'rgba(0,254,218,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selectedGenres.includes(g.id) ? 'rgba(0,254,218,0.4)' : 'var(--border)'}`,
                color: selectedGenres.includes(g.id) ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: selectedGenres.includes(g.id) ? 700 : 400,
                transition: 'all 0.2s ease',
              }}
            >
              {g.emoji} {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      {loading && (
        <div style={{
          background: 'rgba(0,254,218,0.06)',
          border: '1px solid rgba(0,254,218,0.2)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 14,
          color: 'var(--primary)', fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            border: '2px solid rgba(0,254,218,0.3)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.7s linear infinite', flexShrink: 0,
          }} />
          {progress}
        </div>
      )}

      {/* Info */}
      <div style={{
        background: 'rgba(245,158,11,0.06)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 8, padding: '10px 14px', marginBottom: 16,
        fontSize: '0.78rem', color: '#fbbf24', lineHeight: 1.6,
      }}>
        ⚠️ M3U'daki stream URL'leri embed player linkleri içerir. IPTV Smarters (mobil), TiviMate (bazı versiyonlar) ve web tabanlı uygulamalar destekler. Smart TV native uygulamalar doğrudan stream için ek ayar gerektirebilir.
      </div>

      <button
        onClick={generateAndDownload}
        disabled={loading}
        id="m3u-generate-btn"
        style={{
          width: '100%', padding: '14px', borderRadius: 12,
          background: loading ? 'rgba(0,254,218,0.3)' : 'linear-gradient(135deg, #00feda, #00c9a7)',
          color: '#0a0a0f', fontWeight: 700, fontSize: '0.95rem',
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: 'inherit',
        }}
      >
        <Download size={16} />
        {loading ? 'M3U Oluşturuluyor...' : 'M3U Playlist İndir'}
      </button>
    </div>
  );
}

// ===== ANA BİLEŞEN =====
export default function FilmKatalog() {
  const [activeType, setActiveType] = useState('movie');
  const [playingItem, setPlayingItem] = useState(null);
  const [activeView, setActiveView] = useState('catalog'); // catalog | m3u

  const genres = activeType === 'movie' ? MOVIE_GENRES : TV_GENRES;

  return (
    <div>
      {/* Sub-navbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'catalog', label: '🎬 Katalog', icon: <List size={14} /> },
            { id: 'm3u', label: '📥 M3U İndir', icon: <Download size={14} /> },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              id={`catalog-view-${v.id}`}
              style={{
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                background: activeView === v.id ? 'var(--primary-glow)' : 'rgba(255,255,255,0.04)',
                color: activeView === v.id ? 'var(--primary)' : 'var(--text-secondary)',
                border: `1px solid ${activeView === v.id ? 'var(--border-hover)' : 'var(--border)'}`,
                fontWeight: 600, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Film / Dizi toggle */}
        {activeView === 'catalog' && (
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'movie', label: '🎬 Filmler' },
              { id: 'tv', label: '📺 Diziler' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                style={{
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                  background: activeType === t.id ? 'rgba(0,254,218,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeType === t.id ? 'rgba(0,254,218,0.35)' : 'var(--border)'}`,
                  color: activeType === t.id ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 600, fontSize: '0.82rem',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Catalog View */}
      {activeView === 'catalog' && (
        <div>
          {genres.map(genre => (
            <CatalogRow
              key={`${activeType}-${genre.id}`}
              genre={genre}
              type={activeType}
              onPlay={(item, type) => setPlayingItem({ item, type })}
            />
          ))}
        </div>
      )}

      {/* M3U Generator View */}
      {activeView === 'm3u' && <M3UGenerator />}

      {/* Player Modal */}
      {playingItem && (
        <MiniPlayer
          item={playingItem.item}
          type={playingItem.type}
          onClose={() => setPlayingItem(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
    </div>
  );
}
