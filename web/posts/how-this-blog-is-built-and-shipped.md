---
title: How This Blog Is Built and Shipped
date: 2026-10-25
tags: [CI/CD, Security, AI]
description: A static Next.js site, a CMS that commits to Git, AI agents that can only ship through a green pipeline, and the two incidents that shaped it.
---

This blog is small, but it is built the way I would build a production delivery path: every change goes through the same gates, nothing long-lived holds credentials, and an AI agent can do real work on it without being able to skip a step. All of it lives in one public repository, so every claim below can be checked.

## The stack

| Layer | Choice | Why |
| --- | --- | --- |
| Site | Next.js 16 with `output: 'export'`, React 19 | Pure static HTML/CSS/JS: nothing to patch at runtime, cheap to host anywhere |
| Content | Markdown files with YAML frontmatter, rendered with `react-markdown` + `remark-gfm` | Posts are plain files in Git, reviewable like code |
| Editing | Sveltia CMS at `/admin`, signed in with a fine-grained token (Contents: read and write on this repo only) | Editing in the browser still produces a normal Git commit |
| Hosting | GitHub Pages, deployed by GitHub Actions | Free, HTTPS by default, deploys are artifacts rather than a branch of generated files |
| Local preview | Multi-stage Docker image: `node:24-alpine3.24` builds, `nginx:1.30-alpine3.24-slim` serves | The same static output, served the way a container platform would |

The build is also the first quality gate: a post without a `title` or a valid `YYYY-MM-DD` date fails the build, so a broken post can never be deployed.

## The delivery loop

**Nothing reaches main without a green build**

```ship-loop
Edit → Branch → CI → Promote → Deploy, with a loop back from CI on failure
```

*the delivery loop · 5 steps, 1 way back*

1. **Edit.** Changes come from me, from an AI coding agent, or from the CMS.
2. **Branch.** Agents work on `feat/*`, `fix/*`, `chore/*`, `docs/*`, or `content/*` branches. They cannot commit on `main` (more on how below).
3. **CI.** Every push to one of those branches runs `npm ci`, the production build, and `npm audit --omit=dev --audit-level=high`.
4. **Promote.** If CI is green, the workflow checks that `main` is an ancestor of the branch and fast-forwards `main` to it. If `main` has moved on, the job fails and asks for `git merge origin/main`; there is no rebasing and no force-pushing.
5. **Deploy.** The promote job starts the Pages deployment, which uploads `web/out` as an artifact and publishes it.

Every third-party action in both workflows is pinned to a full commit SHA, with the version as a comment, so a moved tag can't change what runs.

## Letting AI agents work on it safely

I use an AI coding agent for a lot of the work on this site. Two things keep that safe.

**The rules are written down where the agent reads them.** `CLAUDE.md` at the repository root defines an eight-stage pipeline every agent must follow: plan, branch, implement, verify, review, security check, ship, confirm. It also states what is off-limits, such as phone numbers and employer-internal details.

**The rules that matter are enforced, not requested.** A `PreToolUse` hook runs before every shell command the agent issues and blocks four things:

| Blocked | Why |
| --- | --- |
| Committing on `main` or `master` | All work goes through a branch and CI |
| Pushing to `main`/`master` (including `HEAD:main`) | Only the CI promote job moves `main` |
| Force-pushing | History on shared branches never gets rewritten |
| `--no-verify` | Checks are fixed, not skipped |

The hook reads the current branch straight from `.git/HEAD` and inspects the command text, so it also catches commands wrapped in other shells (`wsl.exe … bash -c '…'`). It is tested against 17 sample commands, both ones that must be blocked and ones that must pass.

Instructions guide an agent; hooks and CI decide. That split is the main lesson I would carry to any team using agents.

## The CMS path

The CMS commits straight to `main` through the GitHub API, which triggers the deployment directly. That skips branch CI, a deliberate trade-off for typo-level content edits. The build still validates frontmatter, and a failed build leaves the previous version online.

## Two incidents and what they taught me

**1. Two deployers, one site.** When I first switched the site to an Actions-based deploy, GitHub Pages was still set to "Deploy from a branch". Every push therefore started two deployments: mine, and GitHub's own branch build of the repository root, which no longer had an `index.html`. On one push the branch build finished last, and the site served a 404 for a few minutes. The stopgap was a step that waited for the branch build before deploying. The real fix was one setting: **Pages → Source → GitHub Actions**. After that, the stopgap was deleted. Lesson: when two systems can publish to the same place, the last writer wins, and that ordering is not yours to control.

**2. Pushes from `GITHUB_TOKEN` don't trigger workflows.** The promote job fast-forwards `main` using the workflow's own `GITHUB_TOKEN`. GitHub deliberately does not start new workflow runs from such pushes, to prevent loops, so the deploy workflow never fired. The exception is `workflow_dispatch`, so the promote job now calls `gh workflow run deploy.yml --ref main` explicitly. Lesson: read the trigger rules before you design a chain of workflows.

## What I would add for a team

- **Required reviews** on a protected branch, with the promote step replaced by a merge queue.
- **Preview deployments** per branch, so reviewers can click through a change before it ships.
- **Link checking and Lighthouse budgets** in CI, so broken links or slow pages fail the build.
- **Signed commits** for humans and agents, so authorship is verifiable.

The repository is public: [github.com/manhhung3004/manhhung3004.github.io](https://github.com/manhhung3004/manhhung3004.github.io). The workflows are in `.github/workflows/`, the agent rules are in `CLAUDE.md`, and the hook is in `.claude/hooks/sdlc-gate.mjs`.
