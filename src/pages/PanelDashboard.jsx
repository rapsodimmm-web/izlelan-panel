import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { XTREAM_SERVER, XTREAM_HOST, XTREAM_PORT } from './PanelLogin';
import XtreamVOD from '../components/XtreamVOD';
import {
  LogOut, Copy, Check, Tv, Wifi, Calendar, Users,
  Smartphone, Monitor, Zap, MessageCircle, Download,
  ChevronRight, Clock, Shield, Star, Film
} from 'lucide-react';

const APPS = [
  {
    name: 'IPTV Smarters Pro',
    emoji: '📺',
    platform: 'Android / iOS',
    desc: 'En popüler IPTV uygulaması',
    android: 'https://play.google.com/store/apps/details?id=com.nst.iptvsmarterstvbox',
    ios: 'https://apps.apple.com/app/iptv-smarters-player/id1456842111',
    color: '#6366f1',
  },
  {
    name: 'TiviMate',
    emoji: '🎯',
    platform: 'Android / Firestick',
    desc: 'En iyi EPG desteği',
    android: 'https://play.google.com/store/apps/details?id=ar.tvplayer.tv',
    ios: null,
    color: '#f59e0b',
  },
  {
    name: 'GSE Smart IPTV',
    emoji: '🎬',
    platform: 'iOS / macOS',
    desc: 'iPhone ve iPad için ideal',
    android: null,
    ios: 'https://apps.apple.com/app/gse-smart-iptv-player/id1028734023',
    color: '#10b981',
  },
  {
    name: 'VLC Media Player',
    emoji: '🔶',
    platform: 'PC / Mac / Linux',
    desc: 'Bilgisayar için ücretsiz',
    android: 'https://www.videolan.org/vlc/',
    ios: 'https://www.videolan.org/vlc/',
    color: '#f97316',
  },
];

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 6,
        background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
        color: copied ? '#10b981' : 'var(--text-muted)',
        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.3s ease', whiteSpace: 'nowrap',
      }}
      title={`${label} kopyala`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Kopyalandı!' : 'Kopyala'}
    </button>
  );
}

function InfoRow({ label, value, copyable }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid var(--border)',
      gap: 12, flexWrap: 'wrap',
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-all' }}>{value}</span>
        {copyable && <CopyButton text={value} label={label} />}
      </div>
    </div>
  );
}

export default function PanelDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('xtream_user');
    if (!stored) {
      navigate('/panel');
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      navigate('/panel');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('xtream_user');
    navigate('/panel');
  };

  if (!user) return null;

  const { info, server_info, username, password, isOffline } = user;

  // Format expiry date
  const hasExpiry = info.exp_date && info.exp_date !== 'null';
  const expTimestamp = hasExpiry ? parseInt(info.exp_date) * 1000 : null;
  const expDate = expTimestamp ? new Date(expTimestamp) : null;
  const now = Date.now();
  const daysLeft = expTimestamp ? Math.max(0, Math.ceil((expTimestamp - now) / (1000 * 60 * 60 * 24))) : null;
  const isExpired = expTimestamp ? expTimestamp < now : false;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && !isExpired;

  // M3U URL — XUI.one format
  const m3uUrl = `${XTREAM_SERVER}/get.php?username=${username}&password=${password}&type=m3u_plus&output=ts`;
  const m3uUrlSimple = `${XTREAM_SERVER}/get.php?username=${username}&password=${password}&type=m3u_plus`;

  // Xtream Codes bilgileri
  const port = XTREAM_PORT || server_info?.port || '80';
  const host = XTREAM_HOST || '91.229.239.102';

  const TABS = [
    { id: 'overview', label: '📊 Özet' },
    { id: 'catalog', label: '🎬 Film Kataloğu' },
    { id: 'playlist', label: '📋 Playlist' },
    { id: 'apps', label: '📱 Uygulamalar' },
    { id: 'setup', label: '⚙️ Kurulum' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      paddingTop: 0,
    }}>
      {/* Panel Header */}
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{
              fontSize: '1.3rem', fontWeight: 900,
              color: 'var(--primary)', textDecoration: 'none',
            }}>
              izle<span style={{ color: 'white' }}>lan</span>
            </Link>
            <span style={{
              background: 'var(--primary-glow)',
              border: '1px solid var(--border-hover)',
              color: 'var(--primary)',
              padding: '2px 10px', borderRadius: 6,
              fontSize: '0.72rem', fontWeight: 700,
            }}>
              MÜŞTERİ PANELİ
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 12px',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isExpired ? '#ef4444' : '#10b981',
              }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              id="panel-logout-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', fontSize: '0.82rem',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
              Çıkış
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Offline/info banner */}
        {isOffline && (
          <div style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 12, padding: '12px 20px',
            marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 10,
            color: '#818cf8', fontSize: '0.875rem',
          }}>
            ℹ️ <span>Abonelik bilgileriniz sunucudan yüklenemedi. Lütfen doğru kullanıcı adı ve şifre kullandığınızı kontrol edin veya <a href={`https://wa.me/905373028325`} target="_blank" rel="noopener noreferrer" style={{color:'var(--primary)'}}>destek alın</a>.</span>
          </div>
        )}

        {/* Status card */}
        <div style={{
          background: isExpired
            ? 'rgba(239,68,68,0.08)'
            : isExpiringSoon
              ? 'rgba(245,158,11,0.08)'
              : 'rgba(0,254,218,0.06)',
          border: `1px solid ${isExpired ? 'rgba(239,68,68,0.25)' : isExpiringSoon ? 'rgba(245,158,11,0.25)' : 'rgba(0,254,218,0.2)'}`,
          borderRadius: 20,
          padding: '28px 32px',
          marginBottom: 28,
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: isExpired ? 'rgba(239,68,68,0.15)' : isOffline ? 'rgba(99,102,241,0.1)' : 'rgba(0,254,218,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
            }}>
              {isOffline ? '⚠️' : isExpired ? '❌' : isExpiringSoon ? '⚠️' : '✅'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>
                {isOffline ? 'Bağlantı Bilgileri Kaydedildi' : isExpired ? 'Abonelik Sona Erdi' : isExpiringSoon ? 'Abonelik Yakında Bitiyor' : 'Abonelik Aktif'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {isOffline
                  ? 'Sunucu bilgileriniz ve M3U linkiniz aşağıda görüntülenebilir'
                  : isExpired
                    ? `${expDate.toLocaleDateString('tr-TR')} tarihinde sona erdi`
                    : `${expDate?.toLocaleDateString('tr-TR')} tarihine kadar aktif — ${daysLeft} gün kaldı`}
              </div>
            </div>
          </div>

          {(isExpired || isExpiringSoon) && (
            <a
              href="https://wa.me/905373028325?text=Aboneliğimi+yenilemek+istiyorum"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 10, fontWeight: 700,
                textDecoration: 'none', fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                color: 'white',
              }}
            >
              💬 Yenile
            </a>
          )}
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          {[
            {
              icon: <Calendar size={20} />,
              label: 'Bitiş Tarihi',
              value: expDate ? expDate.toLocaleDateString('tr-TR') : 'Bilinmiyor',
              color: '#6366f1',
            },
            {
              icon: <Users size={20} />,
              label: 'Maks. Bağlantı',
              value: `${info.max_connections || '?'} Cihaz`,
              color: '#00feda',
            },
            {
              icon: <Wifi size={20} />,
              label: 'Aktif Bağlantı',
              value: `${info.active_cons || 0} / ${info.max_connections || '?'}`,
              color: '#10b981',
            },
            {
              icon: <Clock size={20} />,
              label: 'Kalan Gün',
              value: isOffline ? 'Bilinmiyor' : isExpired ? 'Sona Erdi' : `${daysLeft} Gün`,
              color: isExpired ? '#ef4444' : daysLeft !== null && daysLeft < 7 ? '#f59e0b' : '#00feda',
            },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14, padding: '20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${s.color}20`,
                border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.color, flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: '1rem' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 24,
          borderBottom: '1px solid var(--border)', paddingBottom: 0,
          overflowX: 'auto',
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
              style={{
                padding: '10px 18px',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Account info */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 24,
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} color="var(--primary)" /> Hesap Bilgileri
              </h3>
              <InfoRow label="Kullanıcı Adı" value={username} copyable />
              <InfoRow label="Şifre" value={password} copyable />
              <InfoRow label="Durum" value={info.status === 'Active' ? '✅ Aktif' : '❌ Pasif'} />
              <InfoRow label="Deneme" value={info.is_trial === '1' ? 'Evet' : 'Hayır'} />
              <div style={{ paddingTop: 12 }}>
                <InfoRow label="Sunucu" value={XTREAM_SERVER} copyable />
              </div>
            </div>

            {/* Quick access */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 24,
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="var(--primary)" /> Hızlı Erişim
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => setActiveTab('playlist')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(0,254,218,0.06)',
                    border: '1px solid rgba(0,254,218,0.15)',
                    color: 'var(--text-primary)', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.875rem',
                  }}
                >
                  <span>📋 M3U Playlist URL</span>
                  <ChevronRight size={14} color="var(--primary)" />
                </button>

                <button
                  onClick={() => setActiveTab('apps')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    color: 'var(--text-primary)', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.875rem',
                  }}
                >
                  <span>📱 Uygulama İndir</span>
                  <ChevronRight size={14} color="#6366f1" />
                </button>

                <a
                  href="https://wa.me/905373028325?text=Teknik+destek+almak+istiyorum"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(37,211,102,0.06)',
                    border: '1px solid rgba(37,211,102,0.15)',
                    color: 'var(--text-primary)', textDecoration: 'none',
                    fontWeight: 600, fontSize: '0.875rem',
                  }}
                >
                  <span>💬 WhatsApp Destek</span>
                  <ChevronRight size={14} color="#25d366" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Film Kataloğu — Gerçek XtreamCodes VOD */}
        {activeTab === 'catalog' && (
          <XtreamVOD username={username} password={password} />
        )}

        {/* Tab: Playlist */}
        {activeTab === 'playlist' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* M3U Plus */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 24,
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>📋 M3U Playlist URL</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                IPTV uygulamanıza bu URL'yi girerek tüm kanalları alabilirsiniz.
              </p>
              <div style={{
                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 16px',
                marginBottom: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                flexWrap: 'wrap',
              }}>
                <code style={{ fontSize: '0.78rem', color: 'var(--primary)', wordBreak: 'break-all', flex: 1 }}>
                  {m3uUrl}
                </code>
                <CopyButton text={m3uUrl} label="M3U URL" />
              </div>
            </div>

            {/* Xtream Codes */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 24,
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>🔑 Xtream Codes Bilgileri</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                TiviMate, IPTV Smarters gibi uygulamalar için "Xtream Codes" seçeneğiyle giriş yapın.
              </p>
              <InfoRow label="Sunucu" value={host} copyable />
              <InfoRow label="Port" value={port} copyable />
              <InfoRow label="Kullanıcı Adı" value={username} copyable />
              <InfoRow label="Şifre" value={password} copyable />
              <div style={{
                marginTop: 12,
                background: 'rgba(0,254,218,0.05)',
                border: '1px solid rgba(0,254,218,0.15)',
                borderRadius: 10, padding: '12px 16px',
                fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7,
              }}>
                💡 <strong style={{ color: 'var(--text-primary)' }}>IPTV Smarters / TiviMate</strong> uygulamasında
                "Xtream Codes" seçeneğiyle bu bilgileri girin.
              </div>
            </div>
          </div>
        )}

        {/* Tab: Apps */}
        {activeTab === 'apps' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {APPS.map((app, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, padding: 24,
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, fontSize: '1.5rem',
                    background: `${app.color}15`,
                    border: `1px solid ${app.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {app.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{app.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{app.platform}</div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{app.desc}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {app.android && (
                    <a
                      href={app.android}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 8,
                        background: `${app.color}15`, border: `1px solid ${app.color}30`,
                        color: app.color, fontWeight: 600, fontSize: '0.8rem',
                        textDecoration: 'none',
                      }}
                    >
                      <Download size={12} /> İndir
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Setup */}
        {activeTab === 'setup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              {
                title: '📺 IPTV Smarters ile Kurulum',
                steps: [
                  'App Store veya Google Play\'den "IPTV Smarters Pro" indirin',
                  'Uygulamayı açın → "Playlist/URL ekle" seçin',
                  '"Xtream Codes API" seçeneğini tıklayın',
                  `Kullanıcı adı: ${username}`,
                  `Şifre: ${password}`,
                  `Sunucu: ${host}`,
                  `Port: ${port}`,
                  '"Ekle" butonuna basın ve kanalları bekleyin',
                ],
              },
              {
                title: '🎯 TiviMate ile Kurulum',
                steps: [
                  'Google Play\'den "TiviMate" indirin (Firestick için desteklenen store)',
                  'TiviMate\'i açın → "Playlist ekle" tıklayın',
                  '"Xtream Codes" seçeneğini seçin',
                  `Host: ${XTREAM_SERVER}`,
                  `Kullanıcı Adı ve Şifre girin`,
                  '"İleri" ile devam edin, kanallar yüklenecek',
                ],
              },
              {
                title: '💻 VLC ile M3U Açma (PC/Mac)',
                steps: [
                  'VLC Media Player\'ı indirin (videolan.org)',
                  'Medya → Ağ Akışı Aç',
                  'Aşağıdaki URL\'yi yapıştırın:',
                  m3uUrlSimple,
                  '"Oynat" butonuna basın',
                ],
              },
            ].map((guide, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, padding: 24,
              }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>{guide.title}</h3>
                <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {guide.steps.map((step, si) => (
                    <li key={si} style={{
                      color: step.startsWith('http') || step.includes(':') && si > 1
                        ? 'var(--primary)'
                        : 'var(--text-secondary)',
                      fontSize: '0.875rem', lineHeight: 1.6,
                      fontFamily: step.startsWith('http') ? 'monospace' : 'inherit',
                      wordBreak: 'break-all',
                    }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            {/* WhatsApp help */}
            <div style={{
              background: 'rgba(37,211,102,0.06)',
              border: '1px solid rgba(37,211,102,0.2)',
              borderRadius: 16, padding: 24, textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Sorun mu yaşıyorsunuz?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
                7/24 WhatsApp destek hattımızdan yardım alın
              </p>
              <a
                href="https://wa.me/905373028325?text=IPTV+kurulumunda+yardıma+ihtiyacım+var"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 28px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #25d366, #128c7e)',
                  color: 'white', fontWeight: 700, textDecoration: 'none',
                }}
              >
                💬 WhatsApp ile Yardım Al
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
