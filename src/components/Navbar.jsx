import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Film, Tv, Star, Home, Tv2 } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/ara?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
            izle<span>lan</span>
          </Link>

          {/* Desktop Links */}
          <ul className="navbar-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                Ana Sayfa
              </NavLink>
            </li>
            <li>
              <NavLink to="/filmler" className={({ isActive }) => isActive ? 'active' : ''}>
                Filmler
              </NavLink>
            </li>
            <li>
              <NavLink to="/diziler" className={({ isActive }) => isActive ? 'active' : ''}>
                Diziler
              </NavLink>
            </li>
            <li>
              <NavLink to="/anime" className={({ isActive }) => isActive ? 'active' : ''}>
                Anime
              </NavLink>
            </li>
            <li>
              <NavLink to="/abone" className={({ isActive }) => isActive ? 'active' : ''}>
                📺 IPTV Al
              </NavLink>
            </li>
          </ul>

          {/* Right side */}
          <div className="navbar-right">
            {/* IPTV CTA Button - Desktop */}
          <Link
            to="/abone"
            className="navbar-iptv-btn"
            id="navbar-iptv-cta"
          >
            📺 IPTV Al
          </Link>

          {/* Panel Button - Desktop */}
          <Link
            to="/panel"
            id="navbar-panel-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem', fontWeight: 600,
              whiteSpace: 'nowrap', textDecoration: 'none',
            }}
          >
            🔑 Panelim
          </Link>

            {/* Search */}
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="Film, dizi ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                id="navbar-search"
              />
              <button type="submit" className="search-btn" aria-label="Ara">
                <Search size={17} />
              </button>
            </form>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          <li>
            <NavLink to="/" end onClick={() => setMobileOpen(false)}
              className={({ isActive }) => isActive ? 'active' : ''}>
              <Home size={18} style={{ display: 'inline', marginRight: 8 }} />
              Ana Sayfa
            </NavLink>
          </li>
          <li>
            <NavLink to="/filmler" onClick={() => setMobileOpen(false)}
              className={({ isActive }) => isActive ? 'active' : ''}>
              <Film size={18} style={{ display: 'inline', marginRight: 8 }} />
              Filmler
            </NavLink>
          </li>
          <li>
            <NavLink to="/diziler" onClick={() => setMobileOpen(false)}
              className={({ isActive }) => isActive ? 'active' : ''}>
              <Tv size={18} style={{ display: 'inline', marginRight: 8 }} />
              Diziler
            </NavLink>
          </li>
          <li>
            <NavLink to="/anime" onClick={() => setMobileOpen(false)}
              className={({ isActive }) => isActive ? 'active' : ''}>
              <Star size={18} style={{ display: 'inline', marginRight: 8 }} />
              Anime
            </NavLink>
          </li>
          <li>
            <NavLink to="/abone" onClick={() => setMobileOpen(false)}
              className={({ isActive }) => isActive ? 'active' : ''}>
              <Tv2 size={18} style={{ display: 'inline', marginRight: 8 }} />
              📺 IPTV Al
            </NavLink>
          </li>
        </ul>

        <div className="mobile-search" style={{ marginTop: 24 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="search-input"
              placeholder="Film, dizi, anime ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '12px 16px',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '1rem',
                width: '100%',
                outline: 'none',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 16px', borderRadius: 10 }}>
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Mobile IPTV CTA */}
        <Link
          to="/abone"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, marginTop: 20,
            background: 'linear-gradient(135deg, #00feda, #00c9a7)',
            color: '#0a0a0f', fontWeight: 700, fontSize: '1rem',
            padding: '14px 24px', borderRadius: 12, textDecoration: 'none',
          }}
        >
          📺 IPTV Aboneliği Al
        </Link>
      </div>
    </>
  );
}
