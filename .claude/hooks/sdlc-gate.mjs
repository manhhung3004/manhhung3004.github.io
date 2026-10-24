// PreToolUse gate for Bash/PowerShell: enforces the git side of the SDLC in CLAUDE.md.
// Exit 2 blocks the command and shows stderr to the agent; exit 0 lets it run.
import fs from 'node:fs';
import path from 'node:path';

const PROTECTED = ['main', 'master'];

let input = {};
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0); // not our payload; never break unrelated tools
}
const cmd = String(input.tool_input?.command ?? '');
if (!/\bgit\b/.test(cmd)) process.exit(0);

// Current branch from .git/HEAD (no git binary needed, works across WSL/Windows paths).
function currentBranch(dir) {
  for (let d = path.resolve(dir || '.'); ; d = path.dirname(d)) {
    try {
      const head = fs.readFileSync(path.join(d, '.git', 'HEAD'), 'utf8').trim();
      return head.startsWith('ref: refs/heads/') ? head.slice(16) : null;
    } catch {}
    if (path.dirname(d) === d) return null;
  }
}

const block = msg => {
  process.stderr.write(`SDLC gate: ${msg}\nSee CLAUDE.md > "Delivery pipeline".\n`);
  process.exit(2);
};

const branch = currentBranch(input.cwd);
const onProtected = PROTECTED.includes(branch);
const protectedRef = new RegExp(`(^|[\\s:+/])(${PROTECTED.join('|')})(\\s|$|['"])`);

for (const part of cmd.split(/&&|\|\||;|\n/)) {
  const push = part.match(/\bgit\s+(?:-\S+\s+)*push\b(.*)/);
  if (push) {
    const args = push[1];
    if (/(^|\s)(-f|--force|--force-with-lease)\b|\s\+\S/.test(args)) block('force-push is not allowed.');
    if (protectedRef.test(args)) block(`pushing to ${PROTECTED.join('/')} is not allowed. Push your feature branch and open a pull request.`);
    // `git push` / `git push origin` with no refspec pushes the current branch.
    if (onProtected && !/\s[^\s-][^\s]*\s+[^\s-]/.test(` ${args.trim()}`)) {
      block(`you are on ${branch}; pushing it directly is not allowed. Create a feature branch first.`);
    }
  }
  if (/\bgit\s+(?:-\S+\s+)*commit\b/.test(part)) {
    if (/--no-verify\b/.test(part)) block('--no-verify skips the checks; fix the failing hook instead.');
    if (onProtected) block(`committing on ${branch} is not allowed. Run: git switch -c <type>/<short-name>`);
  }
}
process.exit(0);
