import site from '../site.json';
import { getPosts, getTags } from '../lib/posts';

export const dynamic = 'force-static';

export default function sitemap() {
  const posts = getPosts();
  const latest = posts[0]?.date;
  return [
    { url: site.url, lastModified: latest },
    { url: `${site.url}/projects`, lastModified: latest },
    { url: `${site.url}/about` },
    ...posts.map(p => ({ url: `${site.url}/posts/${p.slug}`, lastModified: p.date })),
    ...getTags().map(t => ({ url: `${site.url}/tags/${t.slug}` })),
  ];
}
