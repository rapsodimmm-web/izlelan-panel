import { useState, useEffect } from 'react';
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies, getMovieGenres, discoverByGenre } from '../api/tmdb';
import MovieCard from '../components/MovieCard';

const CATEGORIES = [
  { label: 'Popüler', fetchFn: getPopularMovies },
  { label: 'En Çok Puan Alan', fetchFn: getTopRatedMovies },
  { label: 'Vizyonda', fetchFn: getNowPlayingMovies },
  { label: 'Yakında', fetchFn: getUpcomingMovies },
];

export default function MoviesPage() {
  const [active, setActive] = useState(0);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    getMovieGenres().then(res => setGenres(res.data.genres || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    if (selectedGenre) {
      discoverByGenre(selectedGenre, 'movie').then(res => {
        setMovies(res.data.results || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      CATEGORIES[active].fetchFn().then(res => {
        setMovies(res.data.results || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [active, selectedGenre]);

  return (
    <div className="page-wrapper">
      <div className="genres-page">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 24 }}>🎬 Filmler</h1>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              className={`season-tab ${active === i && !selectedGenre ? 'active' : ''}`}
              onClick={() => { setActive(i); setSelectedGenre(null); }}
              id={`movies-cat-${i}`}
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
              id={`genre-${g.id}`}
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
            {movies.filter(m => m.poster_path).map(movie => (
              <MovieCard key={movie.id} item={movie} type="movie" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
