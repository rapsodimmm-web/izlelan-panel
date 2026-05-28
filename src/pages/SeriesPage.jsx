import { useState, useEffect } from 'react';
import { getPopularShows, getTopRatedShows, getAiringToday, getOnAirShows, getTVGenres, discoverByGenre } from '../api/tmdb';
import MovieCard from '../components/MovieCard';

const CATEGORIES = [
  { label: 'Popüler', fetchFn: getPopularShows },
  { label: 'En Çok Puan Alan', fetchFn: getTopRatedShows },
  { label: 'Bugün Yayınlanan', fetchFn: getAiringToday },
  { label: 'Yayında', fetchFn: getOnAirShows },
];

export default function SeriesPage() {
  const [active, setActive] = useState(0);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    getTVGenres().then(res => setGenres(res.data.genres || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    if (selectedGenre) {
      discoverByGenre(selectedGenre, 'tv').then(res => {
        setShows(res.data.results || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      CATEGORIES[active].fetchFn().then(res => {
        setShows(res.data.results || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [active, selectedGenre]);

  return (
    <div className="page-wrapper">
      <div className="genres-page">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 24 }}>📺 Diziler</h1>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              className={`season-tab ${active === i && !selectedGenre ? 'active' : ''}`}
              onClick={() => { setActive(i); setSelectedGenre(null); }}
              id={`series-cat-${i}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Genre chips */}
        <div className="genres-grid" style={{ marginBottom: 30 }}>
          {genres.map(g => (
            <button
              key={g.id}
              className={`genre-chip ${selectedGenre === g.id ? 'active' : ''}`}
              onClick={() => setSelectedGenre(selectedGenre === g.id ? null : g.id)}
              id={`tv-genre-${g.id}`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <span>Yükleniyor...</span>
          </div>
        ) : (
          <div className="search-results-grid">
            {shows.filter(s => s.poster_path).map(show => (
              <MovieCard key={show.id} item={show} type="tv" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
