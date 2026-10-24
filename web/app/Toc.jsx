// Sticky "On this page" list; items come from lib/posts.js (text + slug id of each ## heading).
export default function Toc({ items }) {
  if (items.length < 2) return null;
  return (
    <aside className="toc" aria-label="On this page">
      <p>On this page</p>
      <ol>
        {items.map(h => (
          <li key={h.id}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
