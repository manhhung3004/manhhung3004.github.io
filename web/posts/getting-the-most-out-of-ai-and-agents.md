---
title: A Practical Guide to Getting the Most Out of AI and Agents
date: 2026-10-24
tags: [AI]
description: How to brief AI clearly, manage context, pick the right model, and verify results when working with chat assistants and coding agents.
---

## 1. Overview: the right mindset

Using AI well isn't about "magic" prompts. It's about delegating clearly, giving enough context, and always verifying the result. Treat AI like a talented new colleague: smart and fast, but knowing nothing about your project unless you tell it.

**How chat and agents differ**

| | Chat (Q&A) | Agent (acts on its own) |
| --- | --- | --- |
| How it works | Answers one turn; you do the rest | Reads files, runs commands, edits code, and iterates until done |
| Good for | Questions, brainstorming, drafts, explanations | Bug fixes, refactors, writing tests, log investigations, multi-step tasks |
| Example tools | Claude.ai, ChatGPT | Claude Code, Agent SDK, Cursor agent |
| Main risk | Confidently wrong answers | Wrong actions on real systems |
| Your role | The one asking | The one delegating and reviewing |

**Quick rule of thumb**

- Need to *understand* or *think* → use chat.
- Need to *do* something you can verify with tests, commands, or concrete output → use an agent.
- High-risk work (production, deleting data, sending anything externally) → have the agent plan first; you approve before it runs.

## 2. Writing effective prompts

A good prompt answers five questions: what to do, why, in what context, under which constraints, and what "done" looks like. Leave any of them out and the AI will guess.

**The five parts of a good prompt**

1. **Goal** — the specific task, with a clear verb (fix, write, compare, summarize).
2. **Reason** — the end purpose, so the AI can make the right call in situations you didn't anticipate.
3. **Context** — relevant files, error logs, the audience, what you've already tried.
4. **Constraints** — what's off-limits, which libraries are allowed, length, style.
5. **Definition of done** — which tests must pass, what format the output takes.

**Side-by-side examples**

| Weak prompt | Strong prompt |
| --- | --- |
| "Fix the login bug" | "Since this morning, users report that SSO login returns a 500. Logs are in `logs/auth.log`, lines 1200–1300. Find the cause, fix it, and write a test that reproduces the bug. Don't change the DB schema." |
| "Write a report about the incident" | "Write a postmortem for the slow-API incident on October 20 for non-technical managers. Include a 3-sentence summary, a timeline, the root cause, and remediation actions. One page max." |
| "Optimize this query" | "The query below takes 8s on a 50-million-row table (Postgres 16). Target: under 500ms. Explain the EXPLAIN output first, then propose an index or a rewrite." |

**Advanced tips**

- **Give examples** of the input and output you want; one good example beats a paragraph of description.
- **Say what to do**, not just what to avoid: "write in flowing prose" is clearer than "don't use bullet points".
- **Separate data from instructions** with XML tags or code blocks, e.g. `<log>...</log>`.
- **Ask it to ask** when information is missing: "If the requirements are unclear, ask me before you start."
- **Let AI write the prompt**: describe the task, then ask it to turn that into a detailed prompt.

## 3. Managing context

Context is the AI's "working memory" for a session. Give it the right amount and results are good; overload it and the AI gets distracted, slower, and more expensive.

**Principles**

- **Share what's relevant, not everything.** Only the files, log excerpts, and docs directly tied to the task. With an agent, point to paths (e.g. `@src/auth/login.ts`) and let it read them.
- **One task per session.** When a task is done, start a fresh session (`/clear` in Claude Code). Long sessions full of stale information confuse the AI.
- **Summarize when you need to keep going.** Session too long but the work isn't finished → `/compact` with instructions on what to keep, or have the AI write its state to a file and start over.
- **Offload searching to subagents.** A subagent reads dozens of files and returns only its conclusions, so the main context stays lean.

**Persistent context: memory mechanisms**

| Mechanism | What it's for | Example |
| --- | --- | --- |
| `CLAUDE.md` in the repo | Project conventions shared with the whole team | Build/test commands, folder structure, coding style, "don't edit the `generated/` folder" |
| `~/.claude/CLAUDE.md` | Personal preferences across all projects | "Always reply in Vietnamese", "prefer concise code" |
| Memory | Facts the AI learns across sessions | Your role, feedback you've given |
| Skills | Packaged, repeatable workflows loaded only when needed | Review checklist, deploy procedure, writing a postmortem |

**CLAUDE.md tips:** keep it short (roughly under 200 lines) and only include what the AI can't infer from the code. Whenever you find yourself telling the AI the same thing a second time, add it to the file. Run `/init` to create the first version.

## 4. Working with agents (Claude Code)

Agents are at their best when you give them a way to check their own work (tests, lint, a command to run) and you review their plan before they take on something big.

| Feature | When to use it | How |
| --- | --- | --- |
| Plan mode | Large, multi-file tasks where the approach is unclear | Press `Shift+Tab` to switch; the agent only reads and proposes, and you approve before it edits |
| Permission modes | Balancing speed and safety | Default asks at every step; auto-accept edits for familiar work; auto mode for long tasks in a safe environment |
| Subagents | Broad searches, independent reviews, parallel work | "Use a subagent to find every call to API X"; define your own in `.claude/agents/` |
| Skills | Your own or your team's repeatable workflows | Folder `.claude/skills/<name>/SKILL.md`; invoke with `/name` |
| Hooks | Things that must always happen, regardless of what the AI remembers | Run a formatter after every file edit, block dangerous commands; configured in `settings.json` |
| MCP servers | Connecting external tools | Grafana, Jira, Slack, databases… — the agent queries them directly instead of you copy-pasting |
| Worktree | Running several agents on one repo without collisions | One git worktree per agent, merged when done |
| Slash commands | Quick actions | `/clear`, `/compact`, `/model`, `/init`, `/code-review`, `/rewind` |

**How to delegate to an agent**

1. State the goal and the definition of done: "Done when `npm test` passes with no lint errors."
2. Point to where to start: a file, function, ticket, or log excerpt.
3. For big tasks, ask for a plan first and review it.
4. Let the agent run the tests and keep fixing until they pass, instead of checking in with you at every step.
5. Review the final diff the way you'd review a colleague's PR.

**Running in parallel:** for independent tasks (writing tests for module A, fixing docs for module B), open several sessions or worktrees at once. You shift from doing the work to coordinating and reviewing it.

## 5. Optimizing cost and speed

Picking a model and reasoning level that fit the task, and keeping context lean, are the two biggest levers.

**Choose the model for the job** (Claude 5 family; see the official pricing page for current prices)

| Task type | Suggested model | Why |
| --- | --- | --- |
| Architecture, hard debugging, large refactors, long agent tasks | Opus 5.5 | Deep reasoning, fewer mistakes on complex work |
| Everyday coding, documentation, routine analysis | Sonnet 5.5 | Balances quality, speed, and cost |
| Classification, extraction, bulk summarization, search subagents | Haiku 5.5 | Fastest and cheapest |

**Other levers**

- **Reasoning effort:** use a low level for simple tasks and raise it only for hard ones. More thinking costs more tokens and time.
- **Prompt caching** (when calling the API): put the fixed parts (system prompt, documents, examples) first and mark them for caching; later calls become significantly cheaper and faster.
- **Batch API:** run work that doesn't need immediate results (processing thousands of records) as a batch to cut costs.
- **Cut wasted tokens:** don't paste a 10 MB log file; filter it first with `grep`. Ask for short output when you only need the conclusion.
- **Track spending:** `/cost` and `/context` in Claude Code show how much the session is using.

The biggest cost usually isn't tokens; it's your time spent fixing wrong results. For important work, using a strong model from the start is often cheaper than redoing it several times.

## 6. A standard workflow

Almost every task with an agent follows the same loop: explore, plan, implement, verify, and only then commit.

**Verify before you commit; if it fails, loop back and fix**

```agent-loop
flowchart LR
    A["<b>Explore</b><br/>read code, logs"] --> B["<b>Plan</b><br/>you approve the plan"]
    B --> C["<b>Implement</b><br/>edit code, add tests"]
    C --> D["<b>Verify</b><br/>tests, lint, dry run"]
    D --> E["<b>Commit / PR</b><br/>you review the diff"]
    D -- "not passing → fix again" --> C
    style D fill:#dbeafe,stroke:#2563eb,stroke-width:2px
```

*the shared agent workflow · 5 steps, 1 loop*

Verification is where quality is decided: an agent that can check its own work can fix its own mistakes; without that, you have to do the checking yourself.

**Applying it to different kinds of work**

| Task | How to delegate | Verify with |
| --- | --- | --- |
| Building a new feature | Plan mode → approve the plan → have the agent write both the code and the tests | Passing tests, a manual run of the app, `/code-review` |
| Fixing a bug | Provide repro steps and logs; ask for a test that reproduces the bug before the fix | That test fails before and passes after |
| Understanding an unfamiliar codebase | "Explain how a request flows from the API to the DB, citing files and lines" | Open the cited files and lines to cross-check |
| Research | State the question; require a source for every conclusion | Open the source links and check the key figures |
| Writing documentation | State the audience, purpose, and desired outline; provide a sample doc | Reread it from the reader's point of view |
| Operations / SRE | Connect MCP (Grafana, Loki, Prometheus); "Find out why latency spiked at 2 p.m. — read-only, change nothing" | The queries and dashboards the agent cites; you approve every production change |
| Repetitive tasks | Package them as a skill or schedule them (`/loop`, `/schedule`) | Compare the first few runs with doing it by hand |

## 7. Common mistakes and how to avoid them

Most poor results come from how work is delegated and checked, not from the model.

| Mistake | Symptom | How to avoid it |
| --- | --- | --- |
| Vague prompts | Results that are "right, but not what I needed" | State the goal, the reason, and the definition of done (section 2) |
| Blind trust | Code that breaks in production, made-up figures | Always include a verification step; require sources; read the diff before merging |
| Context overload | The AI forgets the original request and repeats old mistakes | One task per session; `/clear` or `/compact`; use subagents for searching |
| Going in circles | Still wrong after 2–3 rounds of fixes | Stop, `/clear`, and write a fresh prompt with what you've learned; or `/rewind` to an earlier point |
| Delegating too much at once | A giant diff that's hard to review | Break it into independently verifiable steps; commit step by step |
| Overly broad permissions | The agent runs deletes, pushes, or calls production APIs | Limit permissions; use hooks to block dangerous commands; run in a sandbox or worktree |
| Sharing sensitive data | Secrets or customer data end up in prompts | Mask sensitive information; follow your company's AI policy |
| Repeating the same reminder | Having to restate conventions every session | Put them in `CLAUDE.md`, memory, or a skill |

## 8. Checklist and what to learn next

**Before every delegation**

- [ ] Stated the goal, the reason, and the definition of done
- [ ] Pointed to the relevant files, logs, and docs (nothing extra)
- [ ] Picked a suitable model and effort level
- [ ] Big task: turned on plan mode and reviewed the plan
- [ ] The agent has a way to verify its own work (tests, lint, a command to run)

**After getting the result**

- [ ] Read the diff or checked the sources of key figures
- [ ] Added any new convention to `CLAUDE.md` if you had to say it twice
- [ ] Ran `/clear` before moving on to another task

**A suggested 4-week plan**

1. Week 1 — Practice writing prompts with the five parts; run `/init` to create a `CLAUDE.md` for your main project.
2. Week 2 — Use plan mode for every multi-file task; try subagents for searching the codebase.
3. Week 3 — Connect MCP to your everyday tools (Grafana, Jira, Slack); write your first skill for a repetitive workflow.
4. Week 4 — Add hooks (formatting, blocking dangerous commands); try running several agents in parallel with worktrees.

**Further reading**

- [Claude Code documentation](https://docs.claude.com/en/docs/claude-code/overview) — features, configuration, hooks, skills, MCP
- [Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices) — lessons on working with agents from Anthropic
- [Prompt engineering overview](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview) — prompt-writing techniques
- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — design patterns for agent systems
- [Model Context Protocol](https://modelcontextprotocol.io) — the standard for connecting tools to AI

Tip: in Claude Code you can ask "How do I…" about any feature directly, and it will look up the official docs for you.
