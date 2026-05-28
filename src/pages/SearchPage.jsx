import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchMulti } from '../api/tmdb';
import MovieCard from '../components/MovieCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setInputVal(q);
      doSearch(q);
    }
  }, [searchParams]);

  const doSearch = (q) => {
    if (!q.trim()) return;
    setLoading(true);
    searchMulti(q).then(res => {
      const filtered = (res.data.results || []).filter(
        r => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path
      );
      setResults(filtered);
      setTotalResults(res.data.total_results || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="search-page">
        <div className="search-page-header">
          <h1 className="search-page-title">
            {query ? <>
              "<span>{query}</span>" için sonuçlar
            </> : 'Arama'}
          </h1>
          {query && !loading && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {results.length} içerik bulundu
            </p>
          )}

          {/* Search Form */}
          <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'flex', gap: 10, maxWidth: 500 }}>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Film, dizi veya anime ara..."
              id="search-page-input"
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '12px 16px',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 10, padding: '12px 20px' }}>
              <Search size={18} />
              Ara
            </button>
          </form>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <span>Aranıyor...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="search-results-grid">
            {results.map(item => (
              <MovieCard
                key={`${item.media_type}-${item.id}`}
                item={item}
                type={item.media_type}
              />
            ))}
          </div>
        ) : query ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
            <h3>Sonuç bulunamadı</h3>
            <p>"{query}" ile ilgili bir şey bulunamadı. Farklı bir kelime deneyin.</p>
          </div>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎬</div>
            <h3>Ne aramak istersiniz?</h3>
            <p>Film, dizi veya anime adı girerek arama yapın.</p>
          </div>
        )}
      </div>
    </div>
  );
}
