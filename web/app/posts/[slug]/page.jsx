import Link from 'next/link';
import { ScrollProgress, ScrollProgressProvider } from '@animate-ui/react/primitives/scroll-progress';
import { getPost, getPosts, formatDate, slugify } from '../../../lib/posts';
import Prose from '../../Prose';
import Toc from '../../Toc';

// Static export: only the posts that exist at build time.
export const dynamicParams = false;
export const generateStaticParams = () => getPosts().map(p => ({ slug: p.slug }));

export async function generateMetadata({ params }) {
  const { slug, title, description, date, tags } = getPost((await params).slug);
  const images = [{ url: `/og/${slug}.png`, width: 1200, height: 630 }];
  return { title, description, openGraph: { type: 'article', title, description, publishedTime: date, tags, images }, twitter: { images } };
}

export default async function Post({ params }) {
  const post = getPost((await params).slug);
  return (
    <>
      <ScrollProgressProvider global>
        <ScrollProgress className="read-progress" />
      </ScrollProgressProvider>
      <header className="post-header">
        <Link href="/" className="back">← All posts</Link>
        <h1>{post.title}</h1>
        <p className="meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.minutes} min read
        </p>
        {post.tags.length > 0 && (
          <p className="tags">
            {post.tags.map(t => (
              <Link key={t} href={`/tags/${slugify(t)}`} className="tag">{t}</Link>
            ))}
          </p>
        )}
      </header>
      <div className="post-layout">
        <Prose>{post.content}</Prose>
        <Toc items={post.toc} />
      </div>
    </>
  );
}
