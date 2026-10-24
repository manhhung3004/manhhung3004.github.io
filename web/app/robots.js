import site from '../site.json';

export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin/' },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
