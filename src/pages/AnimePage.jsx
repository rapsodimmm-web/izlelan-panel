import { useState, useEffect } from 'react';
import { getAnimeShows, getAnimeMovies } from '../api/tmdb';
import MovieCard from '../components/MovieCard';

export default function AnimePage() {
  const [tab, setTab] = useState('shows');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fn = tab === 'shows' ? getAnimeShows : getAnimeMovies;
    fn().then(res => {
      setItems(res.data.results || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [tab]);

  return (
    <div className="page-wrapper">
      <div className="genres-page">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,101,101,0.15) 0%, rgba(245,101,101,0.05) 100%)',
          border: '1px solid rgba(245,101,101,0.2)',
          borderRadius: 16,
          padding: '30px 24px',
          marginBottom: 32,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎌</div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 8, color: '#f56565' }}>
            Anime
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Japonya'nın en sevilen animasyonları
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          <button
            className={`season-tab ${tab === 'shows' ? 'active' : ''}`}
            onClick={() => setTab('shows')}
            id="anime-shows-tab"
          >
            📺 Anime Diziler
          </button>
          <button
            className={`season-tab ${tab === 'movies' ? 'active' : ''}`}
            onClick={() => setTab('movies')}
            id="anime-movies-tab"
          >
            🎬 Anime Filmler
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <span>Yükleniyor...</span>
          </div>
        ) : (
          <div className="search-results-grid">
            {items.filter(i => i.poster_path).map(item => (
              <MovieCard
                key={item.id}
                item={item}
                type="anime"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
