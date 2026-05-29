/**
 * XtreamVOD — XUI.one panelindeki film ve dizileri kategorik gösterir.
 *
 * Film tıklandığında:
 *  → Hot Player panelin içinde iframe olarak açılır (tam ekran modal)
 *  → Kullanıcı kendi XUI.one hesabıyla otomatik giriş yapar
 *  → İçerik panelden çıkmadan izlenir
 */
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Search, X, Star, ChevronLeft, ChevronRight, Tv, Film, ExternalLink, Volume2, VolumeX, Maximize2, Minimize2, ArrowLeft, Download, AlertTriangle } from 'lucide-react';

const XTREAM_BASE = 'https://panelim.veryplayer.site';
const PANEL_KEY   = 'HxZSfuzV';

/** Vercel proxy üzerinden XtreamCodes API */
async function xtreamApi(username, password, action, extra = {}) {
  const params = new URLSearchParams({ username, password, action, ...extra });
  const res = await fetch(`/api/xtream?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`API hatası: ${res.status}`);
  return res.json();
}

// ─── PREMIUM YEREL OYNATICI VE DETAY PANELİ ──────────────────────────────────
// Hot Player iframe'i yerine doğrudan HLS/MP4 akışlarını oynatan yerel player ve dizi detay paneli

function HotPlayerModal({ stream, username, password, onClose }) {
  const isMovie = !!stream.stream_id;
  
  // State tanımları
  const [loading, setLoading] = useState(!isMovie);
  const [error, setError] = useState(null);
  const [seriesInfo, setSeriesInfo] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('1');
  const [activeStreamUrl, setActiveStreamUrl] = useState(
    isMovie
      ? `${XTREAM_BASE}/movie/${username}/${password}/${stream.stream_id}.${stream.container_extension || 'mp4'}`
      : null
  );
  const [activeTitle, setActiveTitle] = useState(isMovie ? stream.name : null);
  
  // Custom Video Player State ve Ref'leri
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Kumandaların otomatik gizlenmesi
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    if (!isMovie) {
      setLoading(true);
      setError(null);
      xtreamApi(username, password, 'get_series_info', { series_id: stream.series_id })
        .then(res => {
          if (!res || (!res.episodes && !res.seasons)) {
            throw new Error('Dizi bilgileri boş döndü');
          }
          setSeriesInfo(res);
          // İlk sezonu bul
          const sKeys = Object.keys(res.episodes || {});
          if (sKeys.length > 0) {
            setSelectedSeason(sKeys[0]);
          } else if (res.seasons && res.seasons.length > 0) {
            setSelectedSeason(res.seasons[0].season_number?.toString() || '1');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Dizi yükleme hatası:", err);
          setError("Dizi detayları yüklenemedi. Lütfen tekrar deneyin.");
          setLoading(false);
        });
    }

    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [stream]);

  // Fullscreen değişikliğini algılama
  useEffect(() => {
    const handleFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, []);

  // Zaman biçimlendirme
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const paddedS = s < 10 ? `0${s}` : s;
    if (h > 0) {
      const paddedM = m < 10 ? `0${m}` : m;
      return `${h}:${paddedM}:${paddedS}`;
    }
    return `${m}:${paddedS}`;
  };

  // Video İşlemleri
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn("Player play error:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const val = parseFloat(e.target.value);
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolume = (e) => {
    if (videoRef.current) {
      const val = parseFloat(e.target.value);
      videoRef.current.volume = val;
      setVolume(val);
      setIsMuted(val === 0);
      videoRef.current.muted = vol === 0;
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const muted = !isMuted;
      setIsMuted(muted);
      videoRef.current.muted = muted;
      if (!muted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const handleSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
    }
  };

  const handleSkip = (sec) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + sec, duration));
    }
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Fullscreen err:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false));
    }
  };

  const handlePlayEpisode = (episode) => {
    const url = `${XTREAM_BASE}/series/${username}/${password}/${episode.id}.${episode.container_extension || 'mp4'}`;
    setActiveStreamUrl(url);
    setActiveTitle(`${stream.name} - S${episode.season}E${episode.episode_num} - ${episode.title || 'Bölüm'}`);
    setIsPlaying(false);
    setVideoError(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const closeVideo = () => {
    setActiveStreamUrl(null);
    setActiveTitle(null);
    setIsPlaying(false);
    setVideoError(false);
  };

  // Harici player ve indirme linkleri
  const downloadUrl = activeStreamUrl;
  const externalPlayerUrl = activeStreamUrl;

  // MODAL ÜST PANELİ
  const renderHeader = () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'rgba(10, 10, 15, 0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button 
          onClick={activeStreamUrl && !isMovie ? closeVideo : onClose}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 6, borderRadius: '50%', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{activeTitle || stream.name}</span>
            {isMovie && (
              <span style={{
                background: 'rgba(0, 254, 218, 0.1)', border: '1px solid rgba(0,254,218,0.2)',
                color: 'var(--primary)', padding: '1px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700
              }}>FİLM</span>
            )}
            {!isMovie && !activeStreamUrl && (
              <span style={{
                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99,102,241,0.25)',
                color: '#818cf8', padding: '1px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700
              }}>DİZİ</span>
            )}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            izlelan · Premium Oynatıcı
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {activeStreamUrl && (
          <>
            {/* VLC'de Aç */}
            <a
              href={externalPlayerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
                background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245,158,11,0.25)',
                color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700,
                transition: 'all 0.2s',
              }}
              title="Cihazınızdaki VLC veya MX Player'da doğrudan oynatın"
            >
              <ExternalLink size={13} />
              VLC'de Aç
            </a>
            {/* İndir */}
            <a
              href={downloadUrl}
              download
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', fontWeight: 600,
              }}
            >
              <Download size={13} />
              İndir
            </a>
          </>
        )}
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );

  // Yükleme Durumu
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,10,15,0.98)',
        display: 'flex', flexDirection: 'column',
      }}>
        {renderHeader()}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid rgba(0,254,218,0.15)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.7s linear infinite',
            marginBottom: 16,
          }} />
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Dizi ve Bölüm Bilgileri Alınıyor...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  // Hata Durumu
  if (error) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,10,15,0.98)',
        display: 'flex', flexDirection: 'column',
      }}>
        {renderHeader()}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Detaylar Yüklenemedi</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 400, marginBottom: 20 }}>{error}</p>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              color: 'white', fontFamily: 'inherit', fontSize: '0.9rem',
            }}
          >Kapat</button>
        </div>
      </div>
    );
  }

  // Dizi Detay Listeleme
  const renderSeriesDetail = () => {
    if (!seriesInfo) return null;
    const { info, episodes = {} } = seriesInfo;
    
    // Sezon listesini al, yoksa key'lerden eşleştir
    const seasonsList = seriesInfo.seasons && seriesInfo.seasons.length > 0
      ? seriesInfo.seasons
      : Object.keys(episodes).map(sNum => ({
          season_number: sNum,
          name: `Sezon ${sNum}`
        }));

    // Seçili sezon bölümleri
    const activeSeasonEpisodes = episodes[selectedSeason.toString()] || episodes[Number(selectedSeason)] || [];

    // Poster
    const poster = info?.cover || stream.cover || stream.stream_icon;

    return (
      <div style={{
        flex: 1, overflowY: 'auto', background: 'linear-gradient(180deg, #0f0f16 0%, #0a0a0f 100%)',
        display: 'flex', flexDirection: 'column', padding: '32px 24px',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', width: '100%',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32,
        }}>
          {/* Sol Kolon - Bilgi Kartı */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {poster && (
              <img 
                src={poster} 
                alt={stream.name} 
                style={{
                  width: '100%', borderRadius: 16, border: '1px solid var(--border)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  objectFit: 'cover', aspectRatio: '2/3'
                }}
                onError={e => e.target.style.display = 'none'}
              />
            )}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 20,
            }}>
              <h4 style={{ fontWeight: 700, color: 'white', marginBottom: 12, fontSize: '0.95rem' }}>Dizi Künyesi</h4>
              {info?.plot && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: 14 }}>
                  {info.plot}
                </p>
              )}
              {info?.rating && info.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#fbbf24', marginBottom: 8 }}>
                  <Star size={14} fill="#fbbf24" stroke="none" />
                  <strong>IMDb: {parseFloat(info.rating).toFixed(1)}</strong>
                </div>
              )}
              {info?.releaseDate && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  📅 Yayın Yılı: <span style={{ color: 'var(--text-secondary)' }}>{info.releaseDate}</span>
                </div>
              )}
              {info?.genre && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  🎭 Tür: <span style={{ color: 'var(--text-secondary)' }}>{info.genre}</span>
                </div>
              )}
              {info?.cast && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  👥 Oyuncular: <span style={{ color: 'var(--text-secondary)', display: 'block', marginTop: 4, lineHeight: 1.4 }}>{info.cast}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon - Sezonlar & Bölümler */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, gridColumn: 'span 2' }}>
            {/* Sezon Sekmeleri */}
            <div style={{
              display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--border)',
              paddingBottom: 12, scrollbarWidth: 'none'
            }}>
              {seasonsList.map(season => {
                const sNum = season.season_number?.toString() || '1';
                const active = selectedSeason === sNum;
                return (
                  <button
                    key={sNum}
                    onClick={() => setSelectedSeason(sNum)}
                    style={{
                      padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
                      fontSize: '0.82rem', border: 'none', whiteSpace: 'nowrap',
                      background: active ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: active ? '#0a0a0f' : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {season.name || `Sezon ${sNum}`}
                  </button>
                );
              })}
            </div>

            {/* Bölüm Listesi */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: 16 }}>
                Sezon {selectedSeason} Bölümleri ({activeSeasonEpisodes.length})
              </h3>
              
              {activeSeasonEpisodes.length === 0 ? (
                <div style={{
                  padding: '40px 0', textCenter: 'center', color: 'var(--text-muted)',
                  background: 'rgba(255,255,255,0.01)', border: '1px dotted var(--border)',
                  borderRadius: 12, textAlign: 'center', fontSize: '0.85rem'
                }}>
                  Bu sezonda oynatılabilir bölüm bulunamadı.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeSeasonEpisodes.map(ep => {
                    const durationStr = ep.info?.duration || '';
                    return (
                      <div
                        key={ep.id}
                        onClick={() => handlePlayEpisode(ep)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
                          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(0, 254, 218, 0.04)';
                          e.currentTarget.style.borderColor = 'rgba(0, 254, 218, 0.2)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)',
                            flexShrink: 0
                          }}>
                            {ep.episode_num}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white' }}>
                              {ep.title || `${ep.episode_num}. Bölüm`}
                            </div>
                            {ep.info?.plot && (
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {ep.info.plot}
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {durationStr && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ⏳ {durationStr}
                            </span>
                          )}
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #00c9a7 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#0a0a0f', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,254,218,0.2)'
                          }}>
                            <Play size={14} fill="#0a0a0f" color="#0a0a0f" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Video Player Bölümü
  const renderVideoPlayer = () => {
    if (!activeStreamUrl) return null;

    return (
      <div 
        ref={containerRef}
        id="custom-player-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
        style={{
          flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', cursor: showControls ? 'default' : 'none'
        }}
      >
        <video
          ref={videoRef}
          src={activeStreamUrl}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onError={() => setVideoError(true)}
          autoPlay
          style={{
            width: '100%', height: '100%', objectFit: 'contain',
            maxHeight: '100vh',
          }}
          onClick={handlePlayPause}
        />

        {/* Video Hata Bildirimi */}
        {videoError && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(10,10,15,0.96)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 24, textAlign: 'center', color: 'white'
          }}>
            <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: 16 }} />
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Oynatma Hatası / Format Uyumsuzluğu</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
              Bu video formatı (genellikle <strong>.mkv</strong> veya <strong>.ts</strong>) tarayıcınızın dahili oynatıcısı tarafından doğrudan desteklenmiyor. 
              İçeriği izlemek için lütfen sağ üstteki turuncu renkli <strong>"VLC'de Aç"</strong> butonunu tıklayarak VLC player'da oynatın veya doğrudan bilgisayarınıza/telefonunuza indirin.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a 
                href={externalPlayerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
                  background: '#f59e0b', border: '1px solid #f59e0b',
                  color: '#0a0a0f', fontSize: '0.9rem', textDecoration: 'none'
                }}
              >
                VLC Oynatıcıda Aç
              </a>
              <button 
                onClick={closeVideo}
                style={{
                  padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                  color: 'white', fontFamily: 'inherit', fontSize: '0.9rem',
                }}
              >
                Geri Dön
              </button>
            </div>
          </div>
        )}

        {/* Kumanda ve Kontroller Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: showControls ? 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.7) 100%)' : 'none',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none',
          padding: 20
        }}>
          {/* Üst Bar (Kumanda Üstü) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {!isMovie && (
                <button 
                  onClick={closeVideo}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
                    background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', fontSize: '0.8rem',
                  }}
                >
                  <ArrowLeft size={14} />
                  Bölüm Listesi
                </button>
              )}
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {activeTitle}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                background: 'rgba(0,254,218,0.1)', border: '1px solid rgba(0,254,218,0.2)',
                color: 'var(--primary)', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700
              }}>
                CANLI AKIŞ
              </span>
            </div>
          </div>

          {/* Orta Play/Pause Düğme */}
          <div style={{ display: 'flex', alignSelf: 'center', justifySelf: 'center' }}>
            <button 
              onClick={handlePlayPause}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(0,254,218,0.15)', border: '2px solid var(--primary)',
                color: 'var(--primary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0,254,218,0.25)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isPlaying ? <Pause size={28} fill="var(--primary)" /> : <Play size={28} fill="var(--primary)" style={{ marginLeft: 4 }} />}
            </button>
          </div>

          {/* Alt Kontrol Barı */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(10px)', padding: '12px 18px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Süre Çubuğu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontFamily: 'monospace', width: 45, textAlign: 'right' }}>
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  flex: 1, accentColor: 'var(--primary)', cursor: 'pointer', height: 4, borderRadius: 2,
                  outline: 'none', background: 'rgba(255,255,255,0.2)'
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontFamily: 'monospace', width: 45 }}>
                {formatTime(duration)}
              </span>
            </div>

            {/* Butonlar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              {/* Sol kontroller */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={handlePlayPause} style={CTRL_BTN}>
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </button>

                <button onClick={() => handleSkip(-10)} style={CTRL_BTN} title="10 Saniye Geri">
                  <span style={{ fontSize: '0.62rem', fontWeight: 900, marginRight: 2 }}>10s</span>
                  <ChevronLeft size={16} style={{ marginLeft: -4 }} />
                </button>
                
                <button onClick={() => handleSkip(10)} style={CTRL_BTN} title="10 Saniye İleri">
                  <ChevronRight size={16} style={{ marginRight: -4 }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 900, marginLeft: 2 }}>10s</span>
                </button>

                {/* Ses */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={handleMuteToggle} style={CTRL_BTN}>
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolume}
                    style={{
                      width: 60, accentColor: 'var(--primary)', cursor: 'pointer', height: 3,
                      background: 'rgba(255,255,255,0.2)'
                    }}
                  />
                </div>
              </div>

              {/* Sağ kontroller */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Hız */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => handleSpeed(speed)}
                      style={{
                        padding: '2px 6px', borderRadius: 4, cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700,
                        background: playbackRate === speed ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        border: 'none', color: playbackRate === speed ? '#0a0a0f' : 'rgba(255,255,255,0.6)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />

                {/* Fullscreen */}
                <button onClick={handleFullscreenToggle} style={CTRL_BTN}>
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CTRL_BTN = {
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 4, borderRadius: 6, transition: 'all 0.2s',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0a0a0f',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {renderHeader()}
      {activeStreamUrl ? renderVideoPlayer() : renderSeriesDetail()}
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
