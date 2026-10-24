import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Root as Checkbox, Indicator as CheckboxIndicator } from '@animate-ui/react/primitives/radix-ui/checkbox';
import { slugify } from '../lib/posts';
import Flow, { flows } from './Diagram';

const text = n => n.value ?? (n.children ?? []).map(text).join('');

const components = {
  // Same slug as lib/posts.js builds for the table of contents.
  h2: ({ node, children }) => <h2 id={slugify(text(node))}>{children}</h2>,
  pre: ({ node, children }) => {
    const lang = node.children[0]?.properties?.className?.[0]?.replace('language-', '');
    // A fenced block whose language names a flow in Diagram.jsx (```agent-loop) renders as that SVG.
    return lang && Object.hasOwn(flows, lang) ? <Flow name={lang} /> : <pre>{children}</pre>;
  },
  table: ({ node, ...props }) => (
    <div className="table">
      <table {...props} />
    </div>
  ),
  // Task-list boxes (- [ ]) become Animate UI checkboxes that draw their tick.
  input: ({ checked }) => (
    <Checkbox className="task-check" defaultChecked={checked}>
      <CheckboxIndicator className="task-check-mark">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </CheckboxIndicator>
    </Checkbox>
  ),
  a: ({ node, ...props }) =>
    /^https?:/.test(props.href) ? <a {...props} target="_blank" rel="noopener" /> : <a {...props} />,
};

// Renders Markdown (GFM tables, task lists, drawn diagrams) the same way for posts and pages.
export default function Prose({ children }) {
  return (
    <article className="prose">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </Markdown>
    </article>
  );
}
