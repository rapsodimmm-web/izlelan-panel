import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Eye, EyeOff, Lock, User, AlertCircle, ExternalLink, MessageCircle } from 'lucide-react';

// =================================================================
// XUI.one Sunucu Bilgileri
// =================================================================
export const XTREAM_SERVER = 'https://panelim.veryplayer.site';
export const XTREAM_HOST   = 'panelim.veryplayer.site';
export const XTREAM_PORT   = '443';
// =================================================================

const WHATSAPP = '905373028325';
const PROXY    = '/api/xtream'; // Vercel proxy — CORS sorununu çözer

export default function PanelLogin() {
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setError('Kullanıcı adı ve şifre gereklidir.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Vercel proxy üzerinden XUI.one API’ye giriş doğrulaması
      const params = new URLSearchParams({ username: u, password: p });
      const url = `${PROXY}?${params}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

      if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);

      const data = await res.json();

      // XUI.one auth: 1 = başarılı, 0 = hatalı
      if (data?.user_info?.auth === 1 || data?.user_info?.auth === '1') {
        localStorage.setItem('xtream_user', JSON.stringify({
          username: u,
          password: p,
          server: XTREAM_SERVER,
          host: XTREAM_HOST,
          port: XTREAM_PORT,
          info: data.user_info,
          server_info: data.server_info || {},
          loginTime: Date.now(),
        }));
        navigate('/panel/dashboard');
        return;
      }

      // Geçersiz bilgiler
      setError('Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.');
    } catch (err) {
      console.error('[LOGIN ERR]', err.message);
      // Ağ hatası (proxy erişilemiyor) — yine de giriş izni ver
      setError('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%',
        transform: 'translateX(-50%)',
        width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(0,254,218,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 24, padding: '44px 40px',
        position: 'relative',
        boxShadow: '0 30px 100px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 70, height: 70, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(0,254,218,0.15), rgba(99,102,241,0.1))',
            border: '2px solid rgba(0,254,218,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(0,254,218,0.15)',
          }}>
            <Tv size={30} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: 6, letterSpacing: '-0.5px' }}>
            izle<span style={{ color: 'var(--primary)' }}>lan</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            IPTV abonelik bilgilerinizle giriş yapın
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Username */}
          <div>
            <label style={{
              display: 'block', marginBottom: 8,
              fontSize: '0.82rem', fontWeight: 700,
              color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Kullanıcı Adı
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${username ? 'rgba(0,254,218,0.4)' : 'var(--border)'}`,
              borderRadius: 12, padding: '13px 16px',
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
                autoCapitalize="none"
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
            <label style={{
              display: 'block', marginBottom: 8,
              fontSize: '0.82rem', fontWeight: 700,
              color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Şifre
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${password ? 'rgba(0,254,218,0.4)' : 'var(--border)'}`,
              borderRadius: 12, padding: '13px 16px',
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
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer', padding: 2,
                  display: 'flex', alignItems: 'center',
                }}
                aria-label={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '12px 14px',
              color: '#f87171', fontSize: '0.85rem', lineHeight: 1.5,
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            id="panel-login-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '15px', borderRadius: 12, fontWeight: 800,
              fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading
                ? 'rgba(0,254,218,0.5)'
                : 'linear-gradient(135deg, #00feda 0%, #00c9a7 100%)',
              color: '#0a0a0f', border: 'none', fontFamily: 'inherit',
              transition: 'all 0.3s ease', marginTop: 4,
              boxShadow: loading ? 'none' : '0 8px 30px rgba(0,254,218,0.2)',
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 18, height: 18,
                  border: '2px solid rgba(10,10,15,0.3)',
                  borderTopColor: '#0a0a0f', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Doğrulanıyor...
              </>
            ) : '🔑 Panele Giriş Yap'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>yardım mı gerekiyor?</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${WHATSAPP}?text=Merhaba+izlelan+IPTV+abonelik+bilgilerimi+almak+istiyorum`}
          target="_blank"
          rel="noopener noreferrer"
          id="panel-whatsapp-link"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '13px', borderRadius: 12, fontWeight: 700,
            fontSize: '0.9rem', textDecoration: 'none',
            background: 'rgba(37,211,102,0.08)',
            border: '1px solid rgba(37,211,102,0.25)',
            color: '#25d366',
            transition: 'all 0.3s ease', marginBottom: 12,
          }}
        >
          <MessageCircle size={16} />
          WhatsApp'tan Bilgi Al
        </a>

        {/* Admin link */}
        <a
          href={`${XTREAM_SERVER}`}
          target="_blank"
          rel="noopener noreferrer"
          id="panel-external-link"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px', borderRadius: 10, fontWeight: 600,
            fontSize: '0.82rem', textDecoration: 'none',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <ExternalLink size={13} />
          Doğrudan XUI Panel
        </a>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
