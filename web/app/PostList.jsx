import Link from 'next/link';
import { Fades } from '@animate-ui/react/primitives/effects/fade';
import { formatDate } from '../lib/posts';

// Two-column grid of post cards, faded in one after another.
export default function PostList({ posts, more = 'Read post →' }) {
  return (
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
              {p.tags.length > 0 && (
                <span className="tags">
                  {p.tags.map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </span>
              )}
              <span className="card-more">{more}</span>
            </Link>
          </li>
        ))}
      </Fades>
    </ul>
  );
}
