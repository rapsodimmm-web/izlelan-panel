import { useNavigate } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { IMG_W300 } from '../api/tmdb';

export default function MovieCard({ item, type }) {
  const navigate = useNavigate();

  if (!item) return null;

  const isMovie = type === 'movie' || item.media_type === 'movie' || item.title;
  const isTv = type === 'tv' || item.media_type === 'tv' || item.name;
  const isAnime = type === 'anime';

  const title = item.title || item.name || 'Başlık Yok';
  const rating = item.vote_average?.toFixed(1) || '?';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const poster = item.poster_path ? `${IMG_W300}${item.poster_path}` : null;

  const handleClick = () => {
    if (isMovie || item.media_type === 'movie') {
      navigate(`/film/${item.id}`);
    } else {
      navigate(`/dizi/${item.id}`);
    }
  };

  const typeLabel = isAnime ? 'anime' : isMovie ? 'movie' : 'tv';
  const typeText = isAnime ? 'ANİME' : isMovie ? 'FİLM' : 'DİZİ';

  return (
    <div
      className="movie-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${title} - İzle`}
    >
      {/* Type badge */}
      <span className={`movie-card-type type-${typeLabel === 'movie' ? 'movie' : typeLabel === 'anime' ? 'anime' : 'tv'}`}>
        {typeText}
      </span>

      {/* Poster */}
      {poster ? (
        <img
          src={poster}
          alt={title}
          className="movie-card-img"
          loading="lazy"
        />
      ) : (
        <div className="movie-card-no-img">
          <span>{title}</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="movie-card-overlay">
        <div className="movie-card-play">
          <Play size={20} fill="currentColor" />
        </div>
      </div>

      {/* Info */}
      <div className="movie-card-info">
        <p className="movie-card-title">{title}</p>
        <div className="movie-card-meta">
          <span className="movie-card-rating">
            <Star size={11} fill="#fbbf24" />
            {rating}
          </span>
          {year && <span>{year}</span>}
        </div>
      </div>
    </div>
  );
}
