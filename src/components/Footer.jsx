import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';


export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">izlelan</div>
        <p className="footer-desc">
          Film, dizi ve anime izleme platformu. HD kalitede ücretsiz içerikler.
          Tüm veriler TMDB API üzerinden sağlanmaktadır.
        </p>

        <div className="footer-links">
          <Link to="/">Ana Sayfa</Link>
          <Link to="/filmler">Filmler</Link>
          <Link to="/diziler">Diziler</Link>
          <Link to="/anime">Anime</Link>
          <Link to="/ara">Arama</Link>
        </div>

        <div className="footer-tmdb">
          <span className="tmdb-badge">TMDB</span>
          <span>Bu ürün TMDB API kullanmaktadır. TMDB tarafından onaylanmamış veya sertifikalandırılmamıştır.</span>
        </div>

        <p className="footer-copy">
          © {year} İzlelan — Tüm hakları saklıdır. Made with <Heart size={12} style={{ display: 'inline', color: 'var(--primary)' }} /> 
        </p>
      </div>
    </footer>
  );
}
