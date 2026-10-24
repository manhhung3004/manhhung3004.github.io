import site from '../../../site.json';
import { getPost, getPosts, formatDate } from '../../../lib/posts';
import { ogImage } from '../../og';

// Link-preview images exported as /og/<slug>.png (and /og/site.png). The .png lives in the param
// itself because static export names files after the route; an extensionless file would be served
// by GitHub Pages as application/octet-stream, which LinkedIn and others ignore.
export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = () => [{ file: 'site.png' }, ...getPosts().map(p => ({ file: `${p.slug}.png` }))];

export async function GET(_request, { params }) {
  const slug = (await params).file.replace(/\.png$/, '');
  if (slug === 'site') return ogImage({ eyebrow: '~/blog', title: site.description, footer: site.intro });
  const post = getPost(slug);
  return ogImage({
    eyebrow: post.project ? '~/projects' : '~/posts',
    title: post.title,
    tags: post.tags,
    footer: `${formatDate(post.date)} · ${post.minutes} min read`,
  });
}
