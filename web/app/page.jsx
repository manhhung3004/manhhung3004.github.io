import Link from 'next/link';
import site from '../site.json';
import { getPosts, getTags, slugify } from '../lib/posts';
import PostList from './PostList';

export default function Home() {
  const posts = getPosts('posts');
  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">
          ~/blog<span className="cursor" aria-hidden="true" />
        </p>
        <h1>{site.description}</h1>
        {site.intro && (
          <p className="hero-intro">
            {site.intro} <Link href="/about">About me →</Link>
          </p>
        )}
      </section>
      <nav className="tag-bar" aria-label="Topics">
        {getTags().map(t => (
          <Link key={t.slug} href={`/tags/${slugify(t.name)}`} className="tag">
            {t.name} <span>{t.posts.length}</span>
          </Link>
        ))}
      </nav>
      <h2 className="section-label">
        {'// latest posts '}
        <span className="count">{posts.length}</span>
      </h2>
      <PostList posts={posts} />
    </div>
  );
}
