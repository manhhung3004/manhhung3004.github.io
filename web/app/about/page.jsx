import { getPage } from '../../lib/posts';
import Prose from '../Prose';
import Toc from '../Toc';

const page = getPage('about');
// One card per "## " section, so each part of the profile reads as its own block.
const sections = page.content.split(/^(?=## )/m).filter(s => s.trim());

export const metadata = { title: 'About', description: `${page.meta.title} — ${page.meta.description}` };

export default function About() {
  return (
    <>
      <header className="post-header">
        <p className="eyebrow">~/about</p>
        <h1>{page.meta.title}</h1>
        {page.meta.description && <p className="meta">{page.meta.description}</p>}
      </header>
      <div className="post-layout">
        <div className="about">
          {sections.map((s, i) => (
            <section key={i} className="about-card">
              <Prose>{s}</Prose>
            </section>
          ))}
        </div>
        <Toc items={page.toc} />
      </div>
    </>
  );
}
