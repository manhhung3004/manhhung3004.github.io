import Link from 'next/link';
import { Fades } from '@animate-ui/react/primitives/effects/fade';
import site from '../site.json';
import { getPosts, formatDate } from '../lib/posts';

export default function Home() {
  const posts = getPosts();
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
      <h2 className="section-label">
        {'// latest posts '}
        <span className="count">{posts.length}</span>
      </h2>
      <ul className="posts">
        <Fades asChild holdDelay={80}>
          {posts.map(p => (
            <li key={p.slug}>
              <Link href={`/posts/${p.slug}`} className="card">
                <span className="meta">
                  <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.minutes} min read
                </span>
                <span className="card-title">{p.title}</span>
                {p.description && <span className="card-desc">{p.description}</span>}
                <span className="card-more">Read post →</span>
              </Link>
            </li>
          ))}
        </Fades>
      </ul>
    </div>
  );
}
