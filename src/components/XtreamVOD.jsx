/**
 * XtreamVOD — XUI.one panelindeki film ve dizileri kategorik gösterir.
 *
 * Film tıklandığında:
 *  → Hot Player panelin içinde iframe olarak açılır (tam ekran modal)
 *  → Kullanıcı kendi XUI.one hesabıyla otomatik giriş yapar
 *  → İçerik panelden çıkmadan izlenir
 */
import { useState, useEffect, useRef } from 'react';
import { Play, Search, X, Star, ChevronLeft, ChevronRight, Tv, Film, ExternalLink } from 'lucide-react';

const XTREAM_BASE = 'https://panelim.veryplayer.site';
const PANEL_KEY   = 'HxZSfuzV';

/** Vercel proxy üzerinden XtreamCodes API */
async function xtreamApi(username, password, action, extra = {}) {
  const params = new URLSearchParams({ username, password, action, ...extra });
  const res = await fetch(`/api/xtream?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`API hatası: ${res.status}`);
  return res.json();
}

// ─── HOT PLAYER MODAL ────────────────────────────────────────────────────────
// Hot Player'ı izlelan paneli içinde embed eden tam ekran modal

function HotPlayerModal({ stream, username, password, onClose }) {
  const iframeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Hot Player login form'u otomatik gönder
  // XUI.one Hot Player: POST ile username/password gönderilirse oturum açılır
  const hotPlayerBase = `${XTREAM_BASE}/${PANEL_KEY}/`;

  // İframe yüklendikten sonra login formunu doldurup gönder
  const handleIframeLoad = () => {
    setLoaded(true);
    // Iframe içine login bilgilerini göndermek için postMessage dene
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'login', username, password
      }, XTREAM_BASE);
    } catch { /* cross-origin, normal */ }
  };

  // Stream doğrudan URL (bazı tarayıcılarda video olarak açılabilir)
  const directStreamUrl = `http://91.229.239.102/movie/${username}/${password}/${stream.stream_id || stream.series_id}.mp4`;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.97)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Üst bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(0,0,0,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #00feda20, #00feda10)',
            border: '1px solid rgba(0,254,218,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Tv size={16} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>
              {stream.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
              izlelan · XUI.one Hot Player
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Tam sayfada aç */}
          <a
            href={hotPlayerBase}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 8, textDecoration: 'none',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 600,
            }}
          >
            <ExternalLink size={13} />
            Tam Ekran
          </a>

          {/* Kapat */}
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* İçerik alanı */}
      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        {!loaded && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0a0a0f',
            color: 'rgba(255,255,255,0.5)',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '3px solid rgba(0,254,218,0.2)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 0.8s linear infinite',
              marginBottom: 16,
            }} />
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Hot Player yükleniyor...</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
              Açılır açılmaz {username} ile giriş yapın
            </p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Hot Player iframe */}
        <iframe
          ref={iframeRef}
          src={hotPlayerBase}
          onLoad={handleIframeLoad}
          style={{
            flex: 1, width: '100%', height: '100%',
            border: 'none',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          title={`izlelan - ${stream.name}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Alt bilgi şeridi */}
      <div style={{
        padding: '8px 20px',
        background: 'rgba(0,0,0,0.8)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <div style={{
          padding: '4px 10px', borderRadius: 6,
          background: 'rgba(0,254,218,0.08)', border: '1px solid rgba(0,254,218,0.15)',
          fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600,
        }}>
          👤 {username}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          Hot Player açıldığında kullanıcı adı ve şifrenizle giriş yapın, ardından içeriği bulun.
        </span>
      </div>
    </div>
  );
}

// ─── Kategori Satırı ─────────────────────────────────────────────────────────

function VodRow({ category, streams, onPlay }) {
  const scrollRef = useRef(null);
  const visible   = streams.slice(0, 40);

  if (!visible.length) return null;

  const scroll = dir => scrollRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' });

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
        <button onClick={() => scroll(-1)} style={NAV_BTN}><ChevronLeft size={16} /></button>

        <div ref={scrollRef} style={{
          display: 'flex', gap: 12, overflowX: 'auto',
          scrollbarWidth: 'none', paddingBottom: 4,
        }}>
          {visible.map(stream => (
            <div
              key={stream.stream_id || stream.series_id}
              onClick={() => onPlay(stream)}
              style={{ flexShrink: 0, width: 130, cursor: 'pointer', transition: 'transform 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ position: 'relative' }}>
                {/* Poster */}
                <div style={{
                  width: '100%', aspectRatio: '2/3', borderRadius: 10,
                  background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden', position: 'relative',
                }}>
                  {(stream.stream_icon || stream.cover) && (
                    <img
                      src={stream.stream_icon || stream.cover}
                      alt={stream.name}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        display: 'block',
                      }}
                      loading="lazy"
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                </div>

                {/* Hover play */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 10,
                  background: 'rgba(0,0,0,0)', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.65)';
                    e.currentTarget.querySelector('.pb').style.opacity = '1';
                    e.currentTarget.querySelector('.pb').style.transform = 'scale(1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0)';
                    e.currentTarget.querySelector('.pb').style.opacity = '0';
                    e.currentTarget.querySelector('.pb').style.transform = 'scale(0.8)';
                  }}
                >
                  <div className="pb" style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00feda, #00c9a7)',
                    opacity: 0, transform: 'scale(0.8)',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0,254,218,0.4)',
                  }}>
                    <Play size={20} fill="#0a0a0f" color="#0a0a0f" />
                  </div>
                </div>

                {/* Rating */}
                {stream.rating > 0 && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    background: 'rgba(0,0,0,0.85)', borderRadius: 4,
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

        <button onClick={() => scroll(1)} style={{ ...NAV_BTN, right: -12, left: 'auto' }}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

const NAV_BTN = {
  position: 'absolute', left: -12, top: '45%', transform: 'translateY(-50%)',
  zIndex: 10, width: 32, height: 32, borderRadius: '50%',
  background: 'rgba(0,0,0,0.85)', border: '1px solid var(--border)',
  color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export default function XtreamVOD({ username, password }) {
  const [contentType, setContentType] = useState('vod');
  const [categories,  setCategories]  = useState([]);
  const [streamMap,   setStreamMap]   = useState({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [playing,     setPlaying]     = useState(null);

  useEffect(() => {
    setLoading(true); setError(null); setStreamMap({}); setCategories([]);
    loadContent();
  }, [contentType]);

  async function loadContent() {
    try {
      const action = contentType === 'vod' ? 'get_vod_categories' : 'get_series_categories';
      const cats   = await xtreamApi(username, password, action);
      if (!Array.isArray(cats)) throw new Error('Kategoriler alınamadı');
      setCategories(cats);
      for (const cat of cats.slice(0, 6)) loadCategoryStreams(cat.category_id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategoryStreams(catId) {
    if (streamMap[catId]) return;
    try {
      const action  = contentType === 'vod' ? 'get_vod_streams' : 'get_series';
      const streams = await xtreamApi(username, password, action, { category_id: catId });
      if (Array.isArray(streams)) setStreamMap(prev => ({ ...prev, [catId]: streams }));
    } catch { /* devam */ }
  }

  const getSearchResults = () => {
    if (!search) return [];
    const q = search.toLowerCase();
    return Object.values(streamMap).flat()
      .filter(s => (s.name || '').toLowerCase().includes(q))
      .slice(0, 60);
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid rgba(0,254,218,0.15)',
        borderTopColor: 'var(--primary)',
        animation: 'spin 0.7s linear infinite',
        margin: '0 auto 16px',
      }} />
      {contentType === 'vod' ? '🎬 Filmler' : '📺 Diziler'} yükleniyor...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: 16, padding: 32, textAlign: 'center',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
      <p style={{ color: '#f87171', fontWeight: 700, marginBottom: 8 }}>İçerik yüklenemedi</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>{error}</p>
      <button onClick={() => { setLoading(true); loadContent(); }} style={{
        padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
        background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
        color: '#f87171', fontFamily: 'inherit', fontSize: '0.9rem',
      }}>🔄 Tekrar Dene</button>
    </div>
  );

  return (
    <div>
      {/* Üst bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        {[{ id: 'vod', label: '🎬 Filmler' }, { id: 'series', label: '📺 Diziler' }].map(t => (
          <button key={t.id} onClick={() => setContentType(t.id)} style={{
            padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
            fontSize: '0.88rem', border: 'none', fontFamily: 'inherit',
            background: contentType === t.id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
            color: contentType === t.id ? '#0a0a0f' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}

        <div style={{
          flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '9px 14px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`${contentType === 'vod' ? 'Film' : 'Dizi'} ara...`}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.88rem', fontFamily: 'inherit',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex',
            }}><X size={14} /></button>
          )}
        </div>

        <a
          href={`${XTREAM_BASE}/${PANEL_KEY}/`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 14px', borderRadius: 10, textDecoration: 'none',
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            color: '#818cf8', fontWeight: 600, fontSize: '0.82rem',
          }}
        >
          <ExternalLink size={13} />
          Hot Player
        </a>
      </div>

      {/* İçerik */}
      {search ? (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            {getSearchResults().length} sonuç
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {getSearchResults().map(stream => (
              <div
                key={stream.stream_id || stream.series_id}
                onClick={() => setPlaying(stream)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  width: '100%', aspectRatio: '2/3', borderRadius: 10,
                  background: '#1a1a2e', border: '1px solid var(--border)', overflow: 'hidden',
                }}>
                  <img
                    src={stream.stream_icon || stream.cover || ''}
                    alt={stream.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => e.target.style.display = 'none'}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', marginTop: 6, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {stream.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        categories.map(cat => {
          if (!streamMap[cat.category_id]) loadCategoryStreams(cat.category_id);
          return (
            <VodRow
              key={cat.category_id}
              category={cat}
              streams={streamMap[cat.category_id] || []}
              username={username}
              password={password}
              onPlay={stream => setPlaying(stream)}
            />
          );
        })
      )}

      {/* Hot Player modal */}
      {playing && (
        <HotPlayerModal
          stream={playing}
          username={username}
          password={password}
          onClose={() => setPlaying(null)}
        />
      )}
    </div>
  );
}
