import Link from 'next/link';
import { ScrollProgress, ScrollProgressProvider } from '@animate-ui/react/primitives/scroll-progress';
import { getPost, getPosts, formatDate } from '../../../lib/posts';
import Prose from '../../Prose';
import Toc from '../../Toc';

// Static export: only the posts that exist at build time.
export const dynamicParams = false;
export const generateStaticParams = () => getPosts().map(p => ({ slug: p.slug }));

export async function generateMetadata({ params }) {
  const { title, description } = getPost((await params).slug);
  return { title, description };
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
      </header>
      <div className="post-layout">
        <Prose>{post.content}</Prose>
        <Toc items={post.toc} />
      </div>
    </>
  );
}
