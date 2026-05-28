import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTrending, IMG_ORIGINAL } from '../api/tmdb';

export default function Hero() {
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getTrending().then(res => {
      const filtered = res.data.results.filter(i => i.backdrop_path).slice(0, 8);
      setItems(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  const item = items[current];
  const isMovie = item?.media_type === 'movie';
  const title = item?.title || item?.name || '';
  const overview = item?.overview || '';
  const rating = item?.vote_average?.toFixed(1) || '?';
  const year = (item?.release_date || item?.first_air_date || '').slice(0, 4);
  const backdrop = item?.backdrop_path ? `${IMG_ORIGINAL}${item.backdrop_path}` : '';

  const handlePlay = () => {
    if (!item) return;
    const path = isMovie ? `/film/${item.id}` : `/dizi/${item.id}`;
    navigate(path, { state: { autoplay: true } });
  };

  const handleDetail = () => {
    if (!item) return;
    const path = isMovie ? `/film/${item.id}` : `/dizi/${item.id}`;
    navigate(path);
  };

  if (loading) {
    return (
      <div className="hero" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #13131a 100%)' }}>
        <div className="hero-content">
          <div className="skeleton" style={{ height: 20, width: 120, borderRadius: 20, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 60, width: '60%', borderRadius: 8, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="hero">
      {/* Backdrop */}
      <div
        className="hero-backdrop"
        style={{ backgroundImage: `url(${backdrop})` }}
      />

      {/* Content */}
      <div className="hero-content animate-in">
        <div className="hero-badge">
          <Star size={12} fill="currentColor" />
          {isMovie ? 'FİLM' : 'DİZİ'}
        </div>

        <h1 className="hero-title">{title}</h1>

        <div className="hero-meta">
          <span className="hero-rating">
            <Star size={14} fill="#fbbf24" />
            {rating}
          </span>
          {year && <span className="hero-year">{year}</span>}
          <span className="hero-type">{isMovie ? '🎬 Film' : '📺 Dizi'}</span>
        </div>

        {overview && (
          <p className="hero-desc">{overview}</p>
        )}

        <div className="hero-actions">
          <button className="btn btn-primary" onClick={handlePlay} id="hero-play-btn">
            <Play size={18} fill="currentColor" />
            İzle
          </button>
          <button className="btn btn-secondary" onClick={handleDetail} id="hero-detail-btn">
            <Info size={18} />
            Detaylar
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {items.length > 1 && (
        <>
          <button
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              zIndex: 3, width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(10px)',
            }}
            onClick={() => setCurrent(c => (c - 1 + items.length) % items.length)}
            aria-label="Önceki"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              zIndex: 3, width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(10px)',
            }}
            onClick={() => setCurrent(c => (c + 1) % items.length)}
            aria-label="Sonraki"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      <div className="hero-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
