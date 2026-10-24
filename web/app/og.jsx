import { ImageResponse } from 'next/og';
import site from '../site.json';

const ogSize = { width: 1200, height: 630 };

// Link-preview card (LinkedIn, X, Slack...) in the site's dark style. Satori needs display:flex on every box.
export function ogImage({ eyebrow, title, tags = [], footer = '' }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '64px 72px', background: '#0a0a0f', color: '#ececf1',
          backgroundImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.35), transparent 70%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 30, color: '#9b9ba6' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 12,
              background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', color: '#fff', fontSize: 30, fontWeight: 700,
            }}
          >
            h
          </div>
          {site.title}
          <span style={{ color: '#22d3ee' }}>{eyebrow}</span>
        </div>
        <div style={{ display: 'flex', fontSize: title.length > 60 ? 60 : 72, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
          {title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 26, color: '#9b9ba6' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {tags.slice(0, 4).map(t => (
              <div key={t} style={{ display: 'flex', padding: '6px 16px', border: '1px solid #3a3a4a', borderRadius: 999, color: '#22d3ee' }}>
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex' }}>{footer}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
