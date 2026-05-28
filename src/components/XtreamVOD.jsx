/**
 * XtreamVOD — Müşterinin kendi XtreamCodes hesabındaki
 * film ve dizileri kategorik olarak gösterir ve native oynatır.
 *
 * Nasıl çalışır:
 *  1. Müşterinin kullanıcı adı/şifresi localStorage'dan alınır
 *  2. XtreamCodes API'den VOD kategorileri + streamler çekilir
 *  3. Her filme tıklayınca doğrudan M3U8 stream URL'i açılır
 *  4. IPTV uygulaması bu URL'i native olarak oynatır
 */
import { useState, useEffect, useRef } from 'react';
import { Play, Search, X, Star, ChevronLeft, ChevronRight, Tv, Film } from 'lucide-react';

// XtreamCodes sunucu adresi
const XTREAM_BASE = 'http://panelim.veryplayer.site';

// Proxy endpoint — CORS sorununu aşmak için Railway proxy'i kullanır
const PROXY_BASE = 'https://izlelan-stream-proxy-production.up.railway.app';

/**
 * XtreamCodes API'ye proxy üzerinden istek at
 */
async function xtreamApi(username, password, action, extra = {}) {
  // Doğrudan istek dene
  try {
    const params = new URLSearchParams({
      username, password, action, ...extra,
    });
    const url = `${XTREAM_BASE}/HxZSfuzV/player_api.php?${params}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) return res.json();
  } catch { /* CORS hatası — proxy dene */ }

  // Proxy üzerinden
  const params = new URLSearchParams({ username, password, action, ...extra });
  const res = await fetch(
    `${PROXY_BASE}/xtream?${params}`,
    { signal: AbortSignal.timeout(10000) }
  );
  return res.json();
}

/**
 * Film için doğrudan stream URL oluştur
 */
function getStreamUrl(username, password, streamId, ext = 'mkv') {
  return `${XTREAM_BASE}/HxZSfuzV/movie/${username}/${password}/${streamId}.${ext}`;
}

/**
 * Dizi için stream URL
 */
function getSeriesEpUrl(username, password, streamId, ext = 'mkv') {
  return `${XTREAM_BASE}/HxZSfuzV/series/${username}/${password}/${streamId}.${ext}`;
}

// ─── Kategori Satırı ────────────────────────────────────────────────────────

function VodRow({ category, streams, username, password, onPlay }) {
  const scrollRef = useRef(null);
  const visible = streams.slice(0, 30);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' });
  };

  if (!visible.length) return null;

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{category.category_name}</h3>
        <span style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '2px 8px', fontSize: '0.72rem', color: 'var(--text-muted)',
        }}>
          {streams.length} içerik
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <button onClick={() => scroll(-1)} style={navBtn}>
          <ChevronLeft size={16} />
        </button>

        <div ref={scrollRef} style={{
          display: 'flex', gap: 12, overflowX: 'auto',
          scrollbarWidth: 'none', paddingBottom: 4,
        }}>
          {visible.map(stream => (
            <div
              key={stream.stream_id || stream.series_id}
              onClick={() => onPlay(stream, username, password)}
              style={{
                flexShrink: 0, width: 130, cursor: 'pointer',
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ position: 'relative' }}>
                {stream.stream_icon || stream.cover ? (
                  <img
                    src={stream.stream_icon || stream.cover}
                    alt={stream.name}
                    style={{
                      width: '100%', aspectRatio: '2/3', objectFit: 'cover',
                      borderRadius: 10, border: '1px solid var(--border)',
                    }}
                    loading="lazy"
                    onError={e => { e.target.style.display='none'; }}
                  />
                ) : (
                  <div style={{
                    width: '100%', aspectRatio: '2/3', borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--bg-card), #1a1a2e)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', fontSize: '2rem',
                  }}>🎬</div>
                )}

                {/* Play overlay */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 10,
                  background: 'rgba(0,0,0,0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.55)';
                    e.currentTarget.querySelector('.play-btn').style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0)';
                    e.currentTarget.querySelector('.play-btn').style.opacity = '0';
                  }}
                >
                  <div className="play-btn" style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--primary)', color: '#0a0a0f',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                  }}>
                    <Play size={18} fill="#0a0a0f" />
                  </div>
                </div>

                {/* Rating */}
                {stream.rating > 0 && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    background: 'rgba(0,0,0,0.8)', borderRadius: 4,
                    padding: '2px 6px', fontSize: '0.68rem', fontWeight: 700,
                    color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3,
                  }}>
                    <Star size={9} fill="#fbbf24" stroke="none" />
                    {parseFloat(stream.rating).toFixed(1)}
                  </div>
                )}
              </div>

              <p style={{
                fontSize: '0.75rem', fontWeight: 600, marginTop: 6,
                color: 'var(--text-secondary)', lineHeight: 1.3,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {stream.name}
              </p>
            </div>
          ))}
        </div>

        <button onClick={() => scroll(1)} style={{ ...navBtn, right: -12, left: 'auto' }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

const navBtn = {
  position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)',
  zIndex: 10, width: 32, height: 32, borderRadius: '50%',
  background: 'rgba(0,0,0,0.8)', border: '1px solid var(--border)',
  color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// ─── Film Oynatıcı Modal ─────────────────────────────────────────────────────

function PlayerModal({ stream, username, password, onClose }) {
  const exts = ['mkv', 'mp4', 'm3u8', 'ts'];
  const [extIdx, setExtIdx] = useState(0);

  const sid = stream.stream_id || stream.series_id;
  const isVod = !!stream.stream_id;

  const streamUrl = isVod
    ? getStreamUrl(username, password, sid, exts[extIdx])
    : getSeriesEpUrl(username, password, sid, exts[extIdx]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 900 }} onClick={e => e.stopPropagation()}>
        {/* Başlık */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>{stream.name}</span>
            {/* Format seçici */}
            <div style={{ display: 'flex', gap: 4 }}>
              {exts.map((ext, i) => (
                <button key={ext} onClick={() => setExtIdx(i)} style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  background: i === extIdx ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  color: i === extIdx ? '#0a0a0f' : 'white',
                }}>
                  {ext.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Video player */}
        <video
          key={streamUrl}
          controls
          autoPlay
          style={{ width: '100%', borderRadius: 12, background: '#000', maxHeight: '70vh' }}
          src={streamUrl}
        >
          Tarayıcınız bu videoyu desteklemiyor.
        </video>

        {/* Link kopyala */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
              background: 'rgba(0,254,218,0.15)', border: '1px solid rgba(0,254,218,0.3)',
              color: 'var(--primary)', textDecoration: 'none',
            }}
          >
            🔗 Doğrudan Link
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(streamUrl)}
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            📋 M3U URL Kopyala
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ANA BİLEŞEN ────────────────────────────────────────────────────────────

export default function XtreamVOD({ username, password }) {
  const [contentType, setContentType] = useState('vod'); // vod | series
  const [categories, setCategories]   = useState([]);
  const [streamMap, setStreamMap]     = useState({});    // categoryId → streams[]
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [playing, setPlaying]         = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setStreamMap({});
    loadContent();
  }, [contentType, username, password]);

  async function loadContent() {
    try {
      const action = contentType === 'vod' ? 'get_vod_categories' : 'get_series_categories';
      const cats = await xtreamApi(username, password, action);

      if (!Array.isArray(cats)) throw new Error('Kategoriler alınamadı');
      setCategories(cats.slice(0, 20)); // İlk 20 kategori

      // İlk 5 kategoriyi hemen yükle
      const first = cats.slice(0, 5);
      for (const cat of first) {
        loadCategoryStreams(cat.category_id);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategoryStreams(catId) {
    if (streamMap[catId]) return;
    try {
      const action = contentType === 'vod' ? 'get_vod_streams' : 'get_series';
      const streams = await xtreamApi(username, password, action, { category_id: catId });
      if (Array.isArray(streams)) {
        setStreamMap(prev => ({ ...prev, [catId]: streams }));
      }
    } catch { /* devam */ }
  }

  // Görüntü alanına giren kategorileri lazy load et
  const handleCategoryVisible = (catId) => {
    if (!streamMap[catId]) loadCategoryStreams(catId);
  };

  // Arama filtresi
  const filteredCategories = search
    ? [{
        category_id: 'search',
        category_name: `🔍 "${search}" için sonuçlar`,
      }]
    : categories;

  const getSearchResults = () => {
    if (!search) return [];
    const q = search.toLowerCase();
    return Object.values(streamMap).flat().filter(s =>
      (s.name || '').toLowerCase().includes(q)
    ).slice(0, 50);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(0,254,218,0.2)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 0.7s linear infinite',
          margin: '0 auto 16px',
        }} />
        {contentType === 'vod' ? 'Filmler' : 'Diziler'} yükleniyor...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12, padding: 24, textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚠️</div>
        <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>İçerik yüklenemedi</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{error}</p>
        <button
          onClick={() => { setLoading(true); loadContent(); }}
          style={{
            marginTop: 16, padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Üst bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Film / Dizi seçici */}
        {[{ id: 'vod', label: '🎬 Filmler', icon: <Film size={14}/> },
          { id: 'series', label: '📺 Diziler', icon: <Tv size={14}/> }].map(t => (
          <button key={t.id} onClick={() => setContentType(t.id)} style={{
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
            fontSize: '0.85rem', border: 'none', fontFamily: 'inherit',
            background: contentType === t.id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
            color: contentType === t.id ? '#0a0a0f' : 'var(--text-secondary)',
          }}>
            {t.label}
          </button>
        ))}

        {/* Arama */}
        <div style={{
          flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 12px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`${contentType === 'vod' ? 'Film' : 'Dizi'} ara...`}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex',
            }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* İçerik */}
      {search ? (
        // Arama sonuçları
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {getSearchResults().map(stream => (
            <div
              key={stream.stream_id || stream.series_id}
              onClick={() => setPlaying({ stream, username, password })}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={stream.stream_icon || stream.cover || ''}
                  alt={stream.name}
                  style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 10 }}
                  onError={e => { e.target.style.display='none'; }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', marginTop: 6, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {stream.name}
              </p>
            </div>
          ))}
        </div>
      ) : (
        // Kategorik görünüm
        categories.map(cat => {
          handleCategoryVisible(cat.category_id);
          const streams = streamMap[cat.category_id] || [];
          return (
            <VodRow
              key={cat.category_id}
              category={cat}
              streams={streams}
              username={username}
              password={password}
              onPlay={(stream) => setPlaying({ stream, username, password })}
            />
          );
        })
      )}

      {/* Oynatıcı modal */}
      {playing && (
        <PlayerModal
          stream={playing.stream}
          username={playing.username}
          password={playing.password}
          onClose={() => setPlaying(null)}
        />
      )}
    </div>
  );
}
