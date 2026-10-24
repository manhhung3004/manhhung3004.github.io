# hungnm12's blog

Static Next.js 16 blog (`output: 'export'`) published to GitHub Pages at https://manhhung3004.github.io from `main` by `.github/workflows/deploy.yml`.

## Layout

- `web/posts/*.md` — blog posts (YAML frontmatter: `title`, `date` YYYY-MM-DD, `description`, optional `tags: [..]` and `project: true` for /projects). Build fails on a missing title or date. Reuse existing tags (Kubernetes, CI/CD, Observability, AI, Security, GitOps) before inventing new ones.
- `web/content/about.md` — the About page. `web/site.json` — blog title, tagline, intro line.
- `web/app/` — pages; `Prose.jsx` renders Markdown; `Diagram.jsx` holds drawn flows used as ```` ```<flow-name> ```` fences.
- `web/public/admin/` — Sveltia CMS; it commits straight to `main` through the GitHub API.
- `Dockerfile`, `nginx.conf.template`, `run-local.sh` — run the production build locally with Docker.

## Commands

Next 16 needs Node ≥ 20.9. WSL has Node 18, so use: `cd web && npx -y -p node@24 -- npx next build` (or `./run-local.sh rebuild` with Docker). Output goes to `web/out/`.

## Delivery pipeline (mandatory for every agent)

Follow these stages in order. Do not skip a stage; say so explicitly if one does not apply.

1. **Plan** — restate the goal and the definition of done. For changes touching more than a couple of files, workflows, or deployment, show the plan and wait for approval.
2. **Branch** — `git switch -c <type>/<short-name>` with type `feat|fix|chore|docs|content`. Never commit on `main` (enforced by `.claude/hooks/sdlc-gate.mjs`).
3. **Implement** — the smallest change that fully does the job; follow existing patterns; no new dependency without asking.
4. **Verify** — the build must pass. For UI changes, load the affected pages in a browser and check the console. For posts, check frontmatter and that links resolve.
5. **Review** — run `/code-review` (or `/ponytail-review`) on the diff and fix what it finds.
6. **Security** — when the change touches `.github/workflows/`, `web/public/admin/`, dependencies, or anything with secrets: use the `security-audit` skill in guidance mode on the diff, and `npm audit --omit=dev --audit-level=high` must be clean. Pin new GitHub Actions to a full commit SHA.
7. **Ship** — commit with a conventional message and push the branch without asking. CI (`.github/workflows/ci.yml`) builds and audits it; when green, it fast-forwards `main` and starts the deploy. If CI reports that `main` moved on, run `git merge origin/main`, re-verify, and push again (never rebase a pushed branch: that needs a force-push).
8. **Confirm** — check the CI and deploy runs and the live page.

Never push to `main`/`master`, force-push, or use `--no-verify` (all hook-enforced).

## Content rules

- Facts, numbers, and dates in posts must come from a source that was opened; list sources at the end.
- Do not publish phone numbers or employer-internal details (VNG, YouNet Media).
