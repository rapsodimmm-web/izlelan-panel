import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tv, Eye, EyeOff, Lock, User, AlertCircle, ExternalLink } from 'lucide-react';

// ============================================
// Sunucu ayarları
// ============================================
export const XTREAM_SERVER = 'http://panelim.veryplayer.site/HxZSfuzV';
const WHATSAPP = '905373028325';
// ============================================

export default function PanelLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Kullanıcı adı ve şifre gereklidir.');
      return;
    }

    setLoading(true);
    setError('');

    // Birden fazla API endpoint dene
    const endpoints = [
      `${XTREAM_SERVER}/player_api.php`,
      `http://panelim.veryplayer.site/player_api.php`,
      `http://panelim.veryplayer.site:80/player_api.php`,
    ];

    let loginSuccess = false;

    for (const endpoint of endpoints) {
      try {
        const url = `${endpoint}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          if (data?.user_info && data.user_info.auth !== 0) {
            localStorage.setItem('xtream_user', JSON.stringify({
              username, password,
              server: XTREAM_SERVER,
              info: data.user_info,
              server_info: data.server_info || {},
              loginTime: Date.now(),
            }));
            loginSuccess = true;
            break;
          }
        }
      } catch {
        // Bu endpoint çalışmadı, diğerini dene
        continue;
      }
    }

    if (loginSuccess) {
      navigate('/panel/dashboard');
      return;
    }

    // Otomatik bağlantı başarısız → bilgileri doğrudan kaydet (offline mod)
    // Müşteri ne zaman giriş yaparsa bilgileri görsün
    if (username.length >= 3 && password.length >= 3) {
      localStorage.setItem('xtream_user', JSON.stringify({
        username,
        password,
        server: XTREAM_SERVER,
        info: {
          username,
          password,
          status: 'Active',
          exp_date: null, // bilinmiyor
          is_trial: '0',
          active_cons: '0',
          max_connections: '2',
          auth: 1,
        },
        server_info: {},
        loginTime: Date.now(),
        isOffline: true,
      }));
      navigate('/panel/dashboard');
    } else {
      setError('Kullanıcı adı veya şifre çok kısa. Lütfen kontrol edin.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,254,218,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: '40px 36px',
        position: 'relative',
        boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--primary-glow)',
            border: '2px solid var(--border-hover)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--primary)',
          }}>
            <Tv size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 6 }}>
            izle<span style={{ color: 'var(--primary)' }}>lan</span> Panel
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Abonelik bilgilerinize erişin
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Username */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Kullanıcı Adı
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${username ? 'var(--border-hover)' : 'var(--border)'}`,
              borderRadius: 10, padding: '12px 14px',
              transition: 'border-color 0.3s ease',
            }}>
              <User size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="kullanici_adi"
                id="panel-username"
                autoComplete="username"
                style={{
                  flex: 1, background: 'none', border: 'none',
                  color: 'var(--text-primary)', fontFamily: 'inherit',
                  fontSize: '0.95rem', outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Şifre
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${password ? 'var(--border-hover)' : 'var(--border)'}`,
              borderRadius: 10, padding: '12px 14px',
              transition: 'border-color 0.3s ease',
            }}>
              <Lock size={16} color="var(--text-muted)" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                id="panel-password"
                autoComplete="current-password"
                style={{
                  flex: 1, background: 'none', border: 'none',
                  color: 'var(--text-primary)', fontFamily: 'inherit',
                  fontSize: '0.95rem', outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                aria-label={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '10px 14px',
              color: '#f87171', fontSize: '0.85rem',
            }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            id="panel-login-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', borderRadius: 12, fontWeight: 700,
              fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading
                ? 'rgba(0,254,218,0.4)'
                : 'linear-gradient(135deg, #00feda, #00c9a7)',
              color: '#0a0a0f',
              border: 'none', fontFamily: 'inherit',
              transition: 'all 0.3s ease',
              marginTop: 4,
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 18, height: 18, border: '2px solid rgba(10,10,15,0.3)',
                  borderTopColor: '#0a0a0f', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Kontrol ediliyor...
              </>
            ) : (
              <>🔑 Panele Giriş Yap</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>veya</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Alt panel link */}
        <a
          href={`${XTREAM_SERVER}`}
          target="_blank"
          rel="noopener noreferrer"
          id="panel-external-link"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', borderRadius: 12, fontWeight: 600,
            fontSize: '0.9rem', textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            transition: 'all 0.3s ease',
            marginBottom: 16,
          }}
        >
          <ExternalLink size={15} />
          Admin Paneline Git
        </a>

        {/* Help */}
        <div style={{
          padding: '14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>
            Kullanıcı adı ve şifrenizi almak için{' '}
            <a
              href={`https://wa.me/${WHATSAPP}?text=IPTV+kullan%C4%B1c%C4%B1+bilgilerimi+almak+istiyorum`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              WhatsApp'tan bize yazın
            </a>
          </p>
        </div>
      </div>

      {/* CSS spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
