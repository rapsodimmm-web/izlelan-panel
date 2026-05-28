import { useState } from 'react';
import { Play, RefreshCw, ExternalLink } from 'lucide-react';

const SOURCES = {
  movie: [
    {
      name: 'Kaynak 1',
      url: (id) => `https://vidsrc.to/embed/movie/${id}`,
    },
    {
      name: 'Kaynak 2',
      url: (id) => `https://www.2embed.cc/embed/${id}`,
    },
    {
      name: 'Kaynak 3',
      url: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    },
    {
      name: 'Kaynak 4',
      url: (id) => `https://embed.su/embed/movie/${id}`,
    },
  ],
  tv: [
    {
      name: 'Kaynak 1',
      url: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
    },
    {
      name: 'Kaynak 2',
      url: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
    },
    {
      name: 'Kaynak 3',
      url: (id, s, e) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
    },
    {
      name: 'Kaynak 4',
      url: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
    },
  ],
};

export default function VideoPlayer({ type = 'movie', tmdbId, season = 1, episode = 1, title }) {
  const [sourceIdx, setSourceIdx] = useState(0);
  const [key, setKey] = useState(0);

  const sources = SOURCES[type];
  const src = type === 'movie'
    ? sources[sourceIdx].url(tmdbId)
    : sources[sourceIdx].url(tmdbId, season, episode);

  const handleReload = () => setKey(k => k + 1);

  return (
    <div className="player-container">
      <div className="player-header">
        <span className="player-title">
          <Play size={14} style={{ display: 'inline', marginRight: 6 }} />
          {title || 'İzleniyor'}{type === 'tv' ? ` — S${season}E${episode}` : ''}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="player-sources">
            {sources.map((s, i) => (
              <button
                key={i}
                className={`source-btn ${i === sourceIdx ? 'active' : ''}`}
                onClick={() => { setSourceIdx(i); setKey(k => k + 1); }}
                id={`source-btn-${i}`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <button
            onClick={handleReload}
            style={{
              width: 32, height: 32, borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Yenile"
            title="Oynatıcıyı Yenile"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="player-iframe-wrapper">
        <iframe
          key={key}
          src={src}
          className="player-iframe"
          allowFullScreen={true}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          title={title || 'Video Player'}
        />
      </div>

      <div style={{
        padding: '12px 20px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
          Video yüklenmiyor mu? Farklı bir kaynak deneyin.
        </p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--primary)', fontSize: '0.75rem',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <ExternalLink size={12} />
          Yeni sekmede aç
        </a>
      </div>
    </div>
  );
}
