// Five-step flow diagrams, drawn as SVG. A post uses one with a fenced block named after it (```agent-loop).
// The title sits in the Markdown as a bold line above the diagram, so the SVG starts at the boxes.
export const flows = {
  'agent-loop': {
    label: 'Verify before you commit; if it fails, loop back and fix',
    steps: [
      ['Explore', 'read code, logs'],
      ['Plan', 'you approve the plan'],
      ['Implement', 'edit code, add tests'],
      ['Verify', 'tests, lint, dry run'],
      ['Commit / PR', 'you review the diff'],
    ],
    accent: 3,
    loop: { from: 3, to: 2, label: 'not passing → fix again' },
  },
  'ai-pipeline': {
    label: 'Every change, human or AI, passes the same gates',
    steps: [
      ['Change', 'human or agent PR'],
      ['Verify', 'tests, scans, evals'],
      ['Review', 'AI first, human owns'],
      ['Release', 'build once, sign'],
      ['Deploy', 'canary, then ramp'],
    ],
    accent: 1,
    loop: { from: 4, to: 0, label: 'SLO breach → automatic rollback, fix forward' },
  },
};

const cx = [84, 232, 380, 528, 676];

export default function Flow({ name }) {
  const { label, steps, accent, loop } = flows[name];
  return (
    <figure className="diagram">
      <svg viewBox="0 64 760 128" role="img" aria-label={label}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className="ah" />
          </marker>
        </defs>
        {cx.slice(0, 4).map((x, i) => (
          <path key={x} className="edge" d={`M${x + 64} 100H${cx[i + 1] - 64}`} markerEnd="url(#arrow)" />
        ))}
        <path className="edge" d={`M${cx[loop.from]} 128V176H${cx[loop.to]}V128`} markerEnd="url(#arrow)" />
        <text x={(cx[loop.from] + cx[loop.to]) / 2} y="168" textAnchor="middle" className="sub">{loop.label}</text>
        {steps.map(([title, sub], i) => (
          <g key={title} className={i === accent ? 'accent' : undefined}>
            <rect x={cx[i] - 64} y="72" width="128" height="56" rx="10" />
            <text x={cx[i]} y="96" textAnchor="middle" className="name">{title}</text>
            <text x={cx[i]} y="114" textAnchor="middle" className="sub">{sub}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
