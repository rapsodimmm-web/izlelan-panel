import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getPopularShows,
  getTopRatedShows,
  getAiringToday,
  getAnimeShows,
  getAnimeMovies,
} from '../api/tmdb';

function IptvBanner() {
  return (
    <div style={{
      margin: '0 24px 40px',
      maxWidth: 1352,
      marginLeft: 'auto',
      marginRight: 'auto',
      background: 'linear-gradient(135deg, rgba(0,254,218,0.08) 0%, rgba(99,102,241,0.08) 100%)',
      border: '1px solid rgba(0,254,218,0.2)',
      borderRadius: 20,
      padding: '32px 36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute', right: -40, top: -40,
        width: 200, height: 200,
        background: 'radial-gradient(circle, rgba(0,254,218,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
        }}>
          <span style={{ fontSize: '1.6rem' }}>📺</span>
          <span style={{
            background: 'var(--primary)', color: '#0a0a0f',
            padding: '3px 10px', borderRadius: 6,
            fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.5,
          }}>
            YENİ
          </span>
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 6 }}>
          IPTV ile 20.000+ Canlı Kanal İzle!
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 500 }}>
          Smart TV, telefon ve bilgisayardan HD/4K kalitede canlı yayın.
          7/24 teknik destek. Hemen başla!
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative' }}>
        <a
          href="https://wa.me/905373028325?text=IPTV+aboneliği+hakkında+bilgi+almak+istiyorum"
          target="_blank"
          rel="noopener noreferrer"
          id="home-iptv-whatsapp"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10, fontWeight: 700,
            fontSize: '0.9rem', textDecoration: 'none',
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            color: 'white', whiteSpace: 'nowrap',
          }}
        >
          💬 WhatsApp
        </a>
        <Link
          to="/abone"
          id="home-iptv-plans"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10, fontWeight: 700,
            fontSize: '0.9rem', textDecoration: 'none',
            background: 'var(--primary-glow)',
            border: '1px solid var(--border-hover)',
            color: 'var(--primary)', whiteSpace: 'nowrap',
          }}
        >
          📋 Planları Gör
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="page-wrapper">
      <Hero />

      {/* IPTV Banner */}
      <IptvBanner />

      <MovieRow
        title="🔥 Trend"
        fetchFn={getNowPlayingMovies}
        type="movie"
        viewAllLink="/filmler"
      />

      <MovieRow
        title="🎬 Popüler Filmler"
        fetchFn={getPopularMovies}
        type="movie"
        viewAllLink="/filmler"
      />

      <MovieRow
        title="⭐ En Çok Puan Alan Filmler"
        fetchFn={getTopRatedMovies}
        type="movie"
        viewAllLink="/filmler"
      />

      <MovieRow
        title="📺 Popüler Diziler"
        fetchFn={getPopularShows}
        type="tv"
        viewAllLink="/diziler"
      />

      <MovieRow
        title="🆕 Bugün Yayınlanan"
        fetchFn={getAiringToday}
        type="tv"
        viewAllLink="/diziler"
      />

      <MovieRow
        title="⭐ En İyi Diziler"
        fetchFn={getTopRatedShows}
        type="tv"
        viewAllLink="/diziler"
      />

      <MovieRow
        title="🎌 Anime Diziler"
        fetchFn={getAnimeShows}
        type="anime"
        viewAllLink="/anime"
      />

      <MovieRow
        title="🎌 Anime Filmler"
        fetchFn={getAnimeMovies}
        type="anime"
        viewAllLink="/anime"
      />
    </div>
  );
}
