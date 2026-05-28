import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Star, Calendar, Globe, Users, ChevronRight } from 'lucide-react';
import { getShowDetails, IMG_ORIGINAL, IMG_W500 } from '../api/tmdb';
import VideoPlayer from '../components/VideoPlayer';
import EpisodeSelector from '../components/EpisodeSelector';
import MovieCard from '../components/MovieCard';

export default function SeriesDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(location.state?.autoplay || false);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setPlaying(location.state?.autoplay || false);
    setCurrentSeason(1);
    setCurrentEpisode(1);

    getShowDetails(id)
      .then(res => {
        setShow(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  const handleEpisodeSelect = (season, episode) => {
    setCurrentSeason(season);
    setCurrentEpisode(episode);
    if (!playing) setPlaying(true);
    setTimeout(() => {
      document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

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

  if (error || !show) {
    return (
      <div className="page-wrapper">
        <div className="not-found">
          <h2>Dizi bulunamadı</h2>
          <p>Bu dizi mevcut değil veya bir hata oluştu.</p>
        </div>
      </div>
    );
  }

  const backdrop = show.backdrop_path ? `${IMG_ORIGINAL}${show.backdrop_path}` : null;
  const poster = show.poster_path ? `${IMG_W500}${show.poster_path}` : null;
  const rating = show.vote_average?.toFixed(1) || '?';
  const year = show.first_air_date?.slice(0, 4) || '';
  const genres = show.genres || [];
  const similar = show.similar?.results?.filter(s => s.poster_path).slice(0, 12) || [];
  const totalSeasons = show.number_of_seasons || 1;
  const imdbId = show.external_ids?.imdb_id;
  const tvdbId = show.external_ids?.tvdb_id;
  const creators = show.created_by || [];
  const cast = show.credits?.cast?.slice(0, 8) || [];

  // Build TMDB ID for video player (use show ID)
  const playerTmdbId = show.id;

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
            <img src={poster} alt={show.name} className="detail-poster" />
          )}
          <div className="detail-info">
            <h1>{show.name}</h1>
            {show.tagline && (
              <p style={{ color: 'var(--primary)', fontStyle: 'italic', marginBottom: 12, fontSize: '0.95rem' }}>
                "{show.tagline}"
              </p>
            )}

            <div className="detail-tags">
              {genres.map(g => (
                <span key={g.id} className="tag">{g.name}</span>
              ))}
              <span className="tag primary">📺 Dizi</span>
            </div>

            <div className="detail-stats">
              <div className="stat-item">
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span className="stat-rating">{rating}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  ({show.vote_count?.toLocaleString()} oy)
                </span>
              </div>
              {year && (
                <div className="stat-item">
                  <Calendar size={15} />
                  {year}
                </div>
              )}
              <div className="stat-item">
                🎬 {totalSeasons} Sezon
              </div>
              <div className="stat-item">
                📺 {show.number_of_episodes} Bölüm
              </div>
              {show.original_language && (
                <div className="stat-item">
                  <Globe size={15} />
                  {show.original_language.toUpperCase()}
                </div>
              )}
              {show.status && (
                <div className="stat-item">
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
                    background: show.status === 'Returning Series' ? 'rgba(16,185,129,0.2)' : 'rgba(100,100,100,0.2)',
                    color: show.status === 'Returning Series' ? '#10b981' : 'var(--text-muted)',
                    border: `1px solid ${show.status === 'Returning Series' ? 'rgba(16,185,129,0.3)' : 'rgba(100,100,100,0.2)'}`,
                  }}>
                    {show.status === 'Returning Series' ? '🟢 Devam Ediyor' :
                     show.status === 'Ended' ? '🔴 Sona Erdi' :
                     show.status === 'Canceled' ? '⛔ İptal Edildi' : show.status}
                  </span>
                </div>
              )}
            </div>

            {show.overview && (
              <p className="detail-overview">{show.overview}</p>
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
                id="play-show-btn"
              >
                ▶ S{currentSeason}E{currentEpisode} İzle
              </button>
              {imdbId && (
                <a
                  href={`https://www.imdb.com/title/${imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  id="imdb-show-link"
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
              type="tv"
              tmdbId={playerTmdbId}
              season={currentSeason}
              episode={currentEpisode}
              title={`${show.name} — S${currentSeason}E${currentEpisode}`}
            />
          </div>
        )}

        {/* Episode Selector */}
        {totalSeasons > 0 && (
          <div style={{ marginBottom: 40 }}>
            <EpisodeSelector
              showId={id}
              totalSeasons={totalSeasons}
              currentSeason={currentSeason}
              currentEpisode={currentEpisode}
              onSelect={handleEpisodeSelect}
            />
          </div>
        )}

        {/* Cast */}
        {(creators.length > 0 || cast.length > 0) && (
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--primary)" />
              Oyuncular & Ekip
            </h3>
            {creators.length > 0 && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: '0.9rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Yaratıcılar:</strong>{' '}
                {creators.map(c => c.name).join(', ')}
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

        {/* Similar Shows */}
        {similar.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, background: 'var(--primary)', borderRadius: 2, display: 'inline-block', boxShadow: '0 0 8px var(--primary)' }} />
              Benzer Diziler
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: 14, paddingBottom: 8 }}>
                {similar.map(s => (
                  <MovieCard key={s.id} item={s} type="tv" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
