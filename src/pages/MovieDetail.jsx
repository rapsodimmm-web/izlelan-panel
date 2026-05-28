import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Star, Clock, Calendar, Globe, Users, ChevronRight } from 'lucide-react';
import { getMovieDetails, IMG_ORIGINAL, IMG_W500 } from '../api/tmdb';
import VideoPlayer from '../components/VideoPlayer';
import MovieCard from '../components/MovieCard';

export default function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(location.state?.autoplay || false);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setPlaying(location.state?.autoplay || false);
    
    getMovieDetails(id)
      .then(res => {
        setMovie(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-spinner">
          <div className="spinner" />
          <span>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page-wrapper">
        <div className="not-found">
          <h2>Film bulunamadı</h2>
          <p>Bu film mevcut değil veya bir hata oluştu.</p>
        </div>
      </div>
    );
  }

  const backdrop = movie.backdrop_path
    ? `${IMG_ORIGINAL}${movie.backdrop_path}`
    : null;
  const poster = movie.poster_path
    ? `${IMG_W500}${movie.poster_path}`
    : null;
  const rating = movie.vote_average?.toFixed(1) || '?';
  const year = movie.release_date?.slice(0, 4) || '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}s ${movie.runtime % 60}dk` : '';
  const genres = movie.genres || [];
  const similar = movie.similar?.results?.filter(m => m.poster_path).slice(0, 12) || [];
  const imdbId = movie.external_ids?.imdb_id;
  const directors = movie.credits?.crew?.filter(c => c.job === 'Director').slice(0, 2) || [];
  const cast = movie.credits?.cast?.slice(0, 8) || [];

  return (
    <div className="page-wrapper">
      {/* Detail Hero */}
      <div className="detail-hero">
        {backdrop && (
          <div
            className="detail-backdrop"
            style={{ backgroundImage: `url(${backdrop})` }}
          />
        )}
        <div className="detail-content animate-in">
          {poster && (
            <img src={poster} alt={movie.title} className="detail-poster" />
          )}
          <div className="detail-info">
            <h1>{movie.title}</h1>
            {movie.tagline && (
              <p style={{ color: 'var(--primary)', fontStyle: 'italic', marginBottom: 12, fontSize: '0.95rem' }}>
                "{movie.tagline}"
              </p>
            )}

            <div className="detail-tags">
              {genres.map(g => (
                <span key={g.id} className="tag">{g.name}</span>
              ))}
              <span className="tag primary">🎬 Film</span>
            </div>

            <div className="detail-stats">
              <div className="stat-item">
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span className="stat-rating">{rating}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  ({movie.vote_count?.toLocaleString()} oy)
                </span>
              </div>
              {year && (
                <div className="stat-item">
                  <Calendar size={15} />
                  {year}
                </div>
              )}
              {runtime && (
                <div className="stat-item">
                  <Clock size={15} />
                  {runtime}
                </div>
              )}
              {movie.original_language && (
                <div className="stat-item">
                  <Globe size={15} />
                  {movie.original_language.toUpperCase()}
                </div>
              )}
            </div>

            {movie.overview && (
              <p className="detail-overview">{movie.overview}</p>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setPlaying(true);
                  setTimeout(() => {
                    document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                id="play-movie-btn"
              >
                ▶ Filmi İzle
              </button>
              {imdbId && (
                <a
                  href={`https://www.imdb.com/title/${imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  id="imdb-link-btn"
                >
                  IMDB Sayfası
                  <ChevronRight size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        {/* Video Player */}
        {playing && (
          <div id="player-section" style={{ marginBottom: 40, scrollMarginTop: 80 }}>
            <VideoPlayer
              type="movie"
              tmdbId={imdbId || id}
              title={movie.title}
            />
          </div>
        )}

        {/* Cast & Crew */}
        {(directors.length > 0 || cast.length > 0) && (
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--primary)" />
              Oyuncular & Ekip
            </h3>
            {directors.length > 0 && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: '0.9rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Yönetmen:</strong>{' '}
                {directors.map(d => d.name).join(', ')}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {cast.map(actor => (
                <div key={actor.id} style={{ flexShrink: 0, width: 100, textAlign: 'center' }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                    background: 'var(--bg-card)', border: '2px solid var(--border)',
                    margin: '0 auto 8px',
                  }}>
                    {actor.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                        alt={actor.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        👤
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3 }}>{actor.name}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similar.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, background: 'var(--primary)', borderRadius: 2, display: 'inline-block', boxShadow: '0 0 8px var(--primary)' }} />
              Benzer Filmler
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: 14, paddingBottom: 8 }}>
                {similar.map(m => (
                  <MovieCard key={m.id} item={m} type="movie" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
