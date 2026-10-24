import { getPage } from '../../lib/posts';
import Prose from '../Prose';

const page = getPage('about');

export const metadata = { title: page.meta.title, description: page.meta.description };

export default function About() {
  return (
    <>
      <header className="post-header">
        <p className="eyebrow">~/about</p>
        <h1>{page.meta.title}</h1>
        {page.meta.description && <p className="meta">{page.meta.description}</p>}
      </header>
      <div className="post-layout">
        <Prose>{page.content}</Prose>
      </div>
    </>
  );
}
