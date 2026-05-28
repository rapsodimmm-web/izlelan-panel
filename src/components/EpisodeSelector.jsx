import { useState, useEffect } from 'react';
import { getSeasonDetails } from '../api/tmdb';

export default function EpisodeSelector({ showId, totalSeasons, onSelect, currentSeason, currentEpisode }) {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason || 1);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSeasonDetails(showId, selectedSeason).then(res => {
      setEpisodes(res.data.episodes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [showId, selectedSeason]);

  const handleSeasonChange = (s) => {
    setSelectedSeason(s);
    onSelect && onSelect(s, 1);
  };

  const handleEpisodeClick = (ep) => {
    onSelect && onSelect(selectedSeason, ep.episode_number);
  };

  const seasons = Array.from({ length: totalSeasons }, (_, i) => i + 1);

  return (
    <div className="episode-selector">
      <h3 style={{ marginBottom: 16, fontSize: '1.1rem', fontWeight: 700 }}>
        Bölümler
      </h3>

      {/* Season Tabs */}
      <div className="season-tabs">
        {seasons.map(s => (
          <button
            key={s}
            className={`season-tab ${s === selectedSeason ? 'active' : ''}`}
            onClick={() => handleSeasonChange(s)}
            id={`season-tab-${s}`}
          >
            Sezon {s}
          </button>
        ))}
      </div>

      {/* Episodes */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
      ) : (
        <div className="episodes-grid">
          {episodes.map(ep => (
            <div
              key={ep.id}
              className={`episode-card ${
                ep.episode_number === currentEpisode && selectedSeason === currentSeason ? 'active' : ''
              }`}
              onClick={() => handleEpisodeClick(ep)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleEpisodeClick(ep)}
              id={`episode-${selectedSeason}-${ep.episode_number}`}
            >
              <div className="episode-number">{ep.episode_number}</div>
              <div className="episode-info">
                <h4>{ep.name || `Bölüm ${ep.episode_number}`}</h4>
                {ep.overview ? (
                  <p>{ep.overview}</p>
                ) : (
                  <p style={{ fontStyle: 'italic' }}>Açıklama mevcut değil</p>
                )}
              </div>
            </div>
          ))}
          {episodes.length === 0 && (
            <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>
              Bu sezon için bölüm bulunamadı.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
