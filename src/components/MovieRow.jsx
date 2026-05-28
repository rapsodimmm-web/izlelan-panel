import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, fetchFn, type, viewAllLink }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (fetchFn) {
      fetchFn().then(res => {
        setItems(res.data.results || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, []);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="section-link">
            Tümü <ChevronRight size={14} />
          </Link>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          style={{
            position: 'absolute', left: 4, top: '40%', transform: 'translateY(-50%)',
            zIndex: 10, width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(10,10,15,0.9)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          }}
          aria-label="Sola kaydır"
        >
          <ChevronLeft size={18} />
        </button>

        {loading ? (
          <div className="loading-row">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton skeleton-img" />
                <div className="skeleton skeleton-text" style={{ marginTop: 8 }} />
                <div className="skeleton skeleton-text short" style={{ marginTop: 6 }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="movie-row-scroll" ref={scrollRef}>
            {items.map(item => (
              <MovieCard key={item.id} item={item} type={type} />
            ))}
          </div>
        )}

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          style={{
            position: 'absolute', right: 4, top: '40%', transform: 'translateY(-50%)',
            zIndex: 10, width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(10,10,15,0.9)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          }}
          aria-label="Sağa kaydır"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
