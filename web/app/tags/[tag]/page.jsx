import Link from 'next/link';
import { getTags } from '../../../lib/posts';
import PostList from '../../PostList';

// Static export: one page per tag that exists at build time.
export const dynamicParams = false;
export const generateStaticParams = () => getTags().map(t => ({ tag: t.slug }));

const find = async params => {
  const { tag } = await params;
  return getTags().find(t => t.slug === tag);
};

export async function generateMetadata({ params }) {
  const t = await find(params);
  return { title: `#${t.name}`, description: `Posts and projects tagged ${t.name}.` };
}

export default async function Tag({ params }) {
  const t = await find(params);
  return (
    <div className="home">
      <header className="post-header">
        <Link href="/" className="back">← All posts</Link>
        <p className="eyebrow">~/tags/{t.slug}</p>
        <h1>#{t.name}</h1>
        <p className="meta">{t.posts.length} {t.posts.length === 1 ? 'entry' : 'entries'}</p>
      </header>
      <PostList posts={t.posts} />
    </div>
  );
}
