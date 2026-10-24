import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const dir = path.join(process.cwd(), 'posts');

// Splits a Markdown file into YAML frontmatter and body.
function read(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  // The admin CMS writes YAML (quoted / folded strings); the core schema keeps dates as strings.
  return { meta: YAML.parse(m[1]) ?? {}, content: raw.slice(m[0].length) };
}

// A standalone page such as content/about.md.
export const getPage = name => read(path.join(process.cwd(), 'content', `${name}.md`));

function parse(slug) {
  const { meta, content } = read(path.join(dir, `${slug}.md`));
  if (!meta.title || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`posts/${slug}.md: needs a title and a YYYY-MM-DD date`);
  return {
    slug,
    ...meta,
    content,
    minutes: Math.max(1, Math.round(content.split(/\s+/).length / 220)),
    toc: [...content.matchAll(/^## (.+)$/gm)].map(h => ({ text: h[1], id: slugify(h[1]) })),
  };
}

export const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const getPost = parse;

export function getPosts() {
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => parse(f.slice(0, -3)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const formatDate = d => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
