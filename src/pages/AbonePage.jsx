import { useState } from 'react';
import { Check, Tv, Zap, Shield, Headphones, ChevronRight, Star, Play, Wifi, Globe, Monitor } from 'lucide-react';

// =============================================
// 👇 BURAYA KENDİ BİLGİLERİNİZİ GİRİN
// =============================================
const CONFIG = {
  whatsappNumber: '905373028325',
  panelUrl: 'https://panel.siteniz.com', // XtreamCodes panel linkiniz — değiştirin
  siteName: 'İzlelan IPTV',
};
// =============================================

const PLANS = [
  {
    id: 'basic',
    name: 'Başlangıç',
    emoji: '🌟',
    price: '49',
    period: 'aylık',
    color: '#6366f1',
    colorLight: 'rgba(99, 102, 241, 0.15)',
    colorBorder: 'rgba(99, 102, 241, 0.3)',
    popular: false,
    features: [
      '1 Ekran Eş Zamanlı',
      '10.000+ Canlı Kanal',
      'HD Kalite',
      '7/24 Teknik Destek',
      'Film & Dizi Arşivi',
      'Mobil Uyumlu',
    ],
    notIncluded: [
      '4K Ultra HD',
      'Çoklu Ekran',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    emoji: '👑',
    price: '79',
    period: 'aylık',
    color: '#00feda',
    colorLight: 'rgba(0, 254, 218, 0.12)',
    colorBorder: 'rgba(0, 254, 218, 0.35)',
    popular: true,
    features: [
      '2 Ekran Eş Zamanlı',
      '15.000+ Canlı Kanal',
      'Full HD Kalite',
      '4K Ultra HD (Seçili)',
      '7/24 Öncelikli Destek',
      'Film & Dizi Arşivi',
      'Mobil + TV + PC',
      'EPG (Yayın Rehberi)',
    ],
    notIncluded: [],
  },
  {
    id: 'family',
    name: 'Aile',
    emoji: '🏠',
    price: '129',
    period: 'aylık',
    color: '#f59e0b',
    colorLight: 'rgba(245, 158, 11, 0.12)',
    colorBorder: 'rgba(245, 158, 11, 0.3)',
    popular: false,
    features: [
      '4 Ekran Eş Zamanlı',
      '20.000+ Canlı Kanal',
      'Full HD + 4K Kalite',
      '7/24 VIP Destek',
      'Film & Dizi Arşivi',
      'Tüm Cihazlar',
      'EPG (Yayın Rehberi)',
      'VOD (Talep Üzerine)',
    ],
    notIncluded: [],
  },
];

const FEATURES = [
  { icon: <Tv size={28} />, title: '20.000+ Kanal', desc: 'Türk, yabancı, spor, belgesel ve daha fazlası' },
  { icon: <Zap size={28} />, title: 'Sıfır Kesinti', desc: 'Stabil sunucu altyapısı ile kesintisiz yayın' },
  { icon: <Monitor size={28} />, title: '4K Ultra HD', desc: 'Destekleyen kanallarda kristal netliğinde görüntü' },
  { icon: <Globe size={28} />, title: 'Her Cihazda', desc: 'Smart TV, telefon, bilgisayar, tablet uyumlu' },
  { icon: <Shield size={28} />, title: 'Güvenli & Özel', desc: 'Şifreli bağlantı, kişisel hesap güvenliği' },
  { icon: <Headphones size={28} />, title: '7/24 Destek', desc: 'WhatsApp üzerinden anlık teknik destek' },
];

const DEVICES = [
  { name: 'Smart TV', emoji: '📺' },
  { name: 'iPhone & Android', emoji: '📱' },
  { name: 'PC & Mac', emoji: '💻' },
  { name: 'Firestick', emoji: '🔥' },
  { name: 'MAG Box', emoji: '📦' },
  { name: 'Apple TV', emoji: '🍎' },
];

const FAQ = [
  {
    q: 'IPTV nedir?',
    a: 'IPTV (Internet Protocol Television), internet üzerinden canlı TV kanalları ve video içeriklerini izlemenizi sağlayan bir teknolojidir. Netflix gibi ama çok daha fazla kanalla.',
  },
  {
    q: 'Hangi cihazlarda çalışır?',
    a: 'Smart TV, Android telefon/tablet, iPhone/iPad, Windows/Mac bilgisayar, Amazon Firestick, MAG Box, Apple TV ve IPTV destekleyen tüm cihazlarda sorunsuz çalışır.',
  },
  {
    q: 'Deneme sürümü var mı?',
    a: 'Evet! WhatsApp üzerinden bize ulaşın, size 24 saatlik ücretsiz test hesabı açalım.',
  },
  {
    q: 'Ödeme nasıl yapılır?',
    a: 'Havale/EFT, kredi kartı veya papara ile ödeme yapabilirsiniz. Ödeme sonrası hesabınız anında aktifleşir.',
  },
  {
    q: 'İnternet hızım ne olmalı?',
    a: 'HD için minimum 10 Mbps, 4K için 25 Mbps önerilir. Fiber internet ile mükemmel izleme deneyimi yaşarsınız.',
  },
];

export default function AbonePage() {
  const [openFaq, setOpenFaq] = useState(null);

  const waLink = (plan) => {
    const msg = encodeURIComponent(
      `Merhaba! ${CONFIG.siteName} - ${plan} paketi hakkında bilgi almak istiyorum.`
    );
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
  };

  return (
    <div className="page-wrapper">

      {/* ===== HERO ===== */}
      <section style={{
        position: 'relative',
        padding: '80px 24px 60px',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(0,254,218,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,254,218,0.1)', border: '1px solid rgba(0,254,218,0.3)',
            color: 'var(--primary)', padding: '8px 20px', borderRadius: 20,
            fontSize: '0.85rem', fontWeight: 700, marginBottom: 24,
            letterSpacing: 1, textTransform: 'uppercase',
          }}>
            <Tv size={14} /> Premium IPTV Hizmeti
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900,
            lineHeight: 1.15, marginBottom: 20,
          }}>
            Türkiye'nin En İyi<br />
            <span style={{ color: 'var(--primary)', textShadow: '0 0 30px rgba(0,254,218,0.4)' }}>
              IPTV Deneyimi
            </span>
          </h1>

          <p style={{
            fontSize: '1.1rem', color: 'var(--text-secondary)',
            maxWidth: 560, margin: '0 auto 36px',
            lineHeight: 1.7,
          }}>
            20.000+ canlı kanal, binlerce film ve dizi. HD/4K kalite.
            Kesintisiz yayın, 7/24 destek. Hemen başla!
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 40,
            flexWrap: 'wrap', marginBottom: 40,
          }}>
            {[
              { value: '20K+', label: 'Canlı Kanal' },
              { value: '4K', label: 'Ultra HD' },
              { value: '7/24', label: 'Teknik Destek' },
              { value: '%99.9', label: 'Uptime' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={waLink('Premium')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              id="hero-whatsapp-btn"
              style={{ fontSize: '1rem', padding: '16px 32px' }}
            >
              💬 WhatsApp ile Al
            </a>
            <a
              href={CONFIG.panelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              id="hero-panel-btn"
              style={{ fontSize: '1rem', padding: '16px 32px' }}
            >
              🔑 Panele Giriş
              <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ===== PLANS ===== */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
            Abonelik Planları
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            İhtiyacınıza göre en uygun planı seçin. İstediğiniz zaman değiştirin.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24, alignItems: 'start',
        }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              id={`plan-${plan.id}`}
              style={{
                background: plan.colorLight,
                border: `1px solid ${plan.colorBorder}`,
                borderRadius: 20,
                padding: 32,
                position: 'relative',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
                boxShadow: plan.popular ? `0 20px 60px ${plan.colorBorder}` : 'none',
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -16, left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--primary)', color: '#0a0a0f',
                  padding: '6px 20px', borderRadius: 20,
                  fontSize: '0.78rem', fontWeight: 800,
                  whiteSpace: 'nowrap', letterSpacing: 0.5,
                }}>
                  ⭐ EN POPÜLER
                </div>
              )}

              {/* Plan header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{plan.emoji}</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: plan.color }}>
                  {plan.name}
                </h3>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>₺</span>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: plan.color }}>
                    {plan.price}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: plan.colorLight, border: `1px solid ${plan.colorBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Check size={12} color={plan.color} />
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <li key={`no-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', opacity: 0.35 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>✕</span>
                    <span style={{ textDecoration: 'line-through' }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href={waLink(plan.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`whatsapp-${plan.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, padding: '14px', borderRadius: 12,
                    background: plan.popular
                      ? 'linear-gradient(135deg, #00feda, #00c9a7)'
                      : plan.colorLight,
                    border: `1px solid ${plan.colorBorder}`,
                    color: plan.popular ? '#0a0a0f' : plan.color,
                    fontWeight: 700, fontSize: '0.95rem',
                    textDecoration: 'none', transition: 'all 0.3s ease',
                  }}
                >
                  💬 WhatsApp ile Satın Al
                </a>
                <a
                  href={CONFIG.panelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`panel-${plan.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, padding: '12px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '0.85rem',
                    textDecoration: 'none', transition: 'all 0.3s ease',
                  }}
                >
                  🔑 Panel ile Satın Al
                </a>
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 24 }}>
          💡 24 saatlik ücretsiz test için WhatsApp'tan iletişime geçin
        </p>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{
        padding: '60px 24px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
              Neden İzlelan IPTV?
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Rakipsiz özellikler, uygun fiyat</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16, padding: '28px 24px',
                display: 'flex', gap: 16, alignItems: 'flex-start',
                transition: 'border-color 0.3s ease',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                  background: 'var(--primary-glow)', border: '1px solid var(--border-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)',
                }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEVICES ===== */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
            Tüm Cihazlarda Çalışır
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Bir kez abone ol, her yerden izle</p>
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center',
        }}>
          {DEVICES.map((d, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14, padding: '18px 28px',
              display: 'flex', alignItems: 'center', gap: 12,
              fontSize: '0.95rem', fontWeight: 600,
            }}>
              <span style={{ fontSize: '1.6rem' }}>{d.emoji}</span>
              {d.name}
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{
        padding: '60px 24px',
        background: 'rgba(0,254,218,0.03)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 48 }}>
            Nasıl Başlarım?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 32,
          }}>
            {[
              { step: '1', icon: '💬', title: 'Bize Yazın', desc: 'WhatsApp\'tan mesaj gönderin, paketinizi seçin' },
              { step: '2', icon: '💳', title: 'Ödeme Yapın', desc: 'Havale, kart veya papara ile güvenli ödeme' },
              { step: '3', icon: '🔑', title: 'Bilgileri Alın', desc: 'Kullanıcı adı ve şifreniz anında gönderilir' },
              { step: '4', icon: '▶️', title: 'İzlemeye Başlayın', desc: 'Uygulamayı kurun ve hemen izlemeye başlayın' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--primary-glow)', border: '2px solid var(--border-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', margin: '0 auto 16px',
                }}>
                  {s.icon}
                </div>
                <div style={{
                  position: 'absolute', top: 14, right: 0,
                  fontSize: '0.7rem', fontWeight: 800,
                  color: 'var(--primary)', opacity: 0.6,
                  display: i < 3 ? 'block' : 'none',
                }}>
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32, textAlign: 'center' }}>
          Sık Sorulan Sorular
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ.map((item, i) => (
            <div key={i} id={`faq-${i}`} style={{
              background: 'var(--bg-card)',
              border: `1px solid ${openFaq === i ? 'var(--border-hover)' : 'var(--border)'}`,
              borderRadius: 14,
              overflow: 'hidden',
              transition: 'border-color 0.3s ease',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '18px 22px',
                  background: 'none', cursor: 'pointer', textAlign: 'left',
                  color: openFaq === i ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: 600, fontSize: '0.95rem', gap: 12,
                }}
              >
                {item.q}
                <span style={{
                  flexShrink: 0,
                  transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'transform 0.3s ease',
                  color: 'var(--primary)',
                }}>
                  <ChevronRight size={18} />
                </span>
              </button>
              {openFaq === i && (
                <div style={{
                  padding: '0 22px 18px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem', lineHeight: 1.7,
                }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section style={{
        padding: '60px 24px 80px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(0,254,218,0.06) 0%, rgba(0,254,218,0.02) 100%)',
        borderTop: '1px solid rgba(0,254,218,0.15)',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎬</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
            Hemen Başla
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7 }}>
            24 saatlik ücretsiz test sürümü için şimdi WhatsApp'tan yazın.
            Hiçbir taahhüt yok, istediğiniz zaman iptal edebilirsiniz.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={waLink('Premium')}
              target="_blank"
              rel="noopener noreferrer"
              id="bottom-whatsapp-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '16px 36px', borderRadius: 14, fontWeight: 700,
                fontSize: '1.05rem', textDecoration: 'none',
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                color: 'white',
                boxShadow: '0 8px 30px rgba(37, 211, 102, 0.3)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp ile Başla
            </a>
            <a
              href={CONFIG.panelUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="bottom-panel-btn"
              className="btn btn-secondary"
              style={{ padding: '16px 32px', fontSize: '1rem' }}
            >
              🔑 Panele Git
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
