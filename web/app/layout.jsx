import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import site from '../site.json';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.title}` },
  description: site.description,
  openGraph: { siteName: site.title, type: 'website', images: [{ url: '/og/site.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image' },
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">h</span>
              {site.title}
            </Link>
            <nav className="site-nav">
              <Link href="/">Blog</Link>
              <Link href="/projects">Projects</Link>
              <Link href="/about">About</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            © {new Date().getFullYear()} · Built with Next.js · <a href="/rss.xml">RSS</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
