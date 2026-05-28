import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <div className="not-found animate-in">
        <h1>404</h1>
        <h2>Sayfa Bulunamadı</h2>
        <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <Link to="/" className="btn btn-primary" id="back-home-btn" style={{ textDecoration: 'none' }}>
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
