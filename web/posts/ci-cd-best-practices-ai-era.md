---
title: CI/CD Best Practices for the AI Era
date: 2026-10-24
tags: [CI/CD, Security, AI]
description: AI made writing code cheap and shipping it riskier. Eight practices, with GitLab CI examples, for a pipeline that keeps up with AI-generated changes and doesn't become the easiest way into your systems.
---

AI has made writing code cheap. It has not made shipping code safe. Almost every team now uses AI assistants, and many let agents open merge requests on their own. The volume of changes going into pipelines has jumped, but the share that reaches production in good shape has not kept up.

That shifts the job of CI/CD. The pipeline used to be a convenience that automated builds and deploys. Now it is the main control that decides whether a flood of machine-written changes makes your product better or less stable. It has also become a favorite target for attackers, including attacks that work by talking to the AI agents inside it.

This post covers what the data says, then eight practices that hold up in 2026. The examples use **GitLab CI/CD**, but the ideas apply to any CI system.

## What the data says

Two large studies from the past year tell the same story from different angles.

**DORA's 2025 report**, [State of AI-assisted Software Development](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report), surveyed nearly 5,000 technology professionals:

- 90% use AI at work, and more than 80% say it made them more productive. Still, 30% have little or no trust in AI-generated code.
- AI adoption now has a *positive* relationship with delivery throughput, but it still has a *negative* relationship with delivery stability.
- Its headline: "AI doesn't fix a team; it amplifies what's already there."

**CircleCI's [2026 State of Software Delivery](https://circleci.com/blog/five-takeaways-2026-software-delivery-report)** analyzed about 28.7 million CI workflows from September 2025:

| Metric | Change |
| --- | --- |
| Average daily workflow runs | +59% year over year, but +97% for the top 5% of teams and only +4% for the median team |
| Median team, feature-branch throughput | +15% |
| Median team, main-branch throughput | −7% |
| Main-branch success rate | 70.8%, the lowest in over five years (CircleCI's benchmark is 90%) |
| Median recovery time | +13%, to 72 minutes |

One caveat: CircleCI's "throughput" counts pipeline runs, not production deployments, as [Rob Bowley points out](https://blog.robbowley.net/2026/04/02/more-code-less-delivery-but-does-the-circleci-2026-report-really-show-1-in-20-teams-are-benefiting/). Even so, the direction matches DORA: teams write more code, but more of it breaks, and it takes longer to fix. The bottleneck has moved from *writing* code to *validating, integrating, and recovering*. DORA puts it plainly: "Without robust control systems, like strong automated testing, mature version control practices, and fast feedback loops, an increase in change volume leads to instability."

## The shape of an AI-era pipeline

The core idea is simple: a change from an agent goes through exactly the same gates as a change from a person. Nothing gets a shortcut because a model wrote it, and nothing gets merged because a model reviewed it.

**Every change, human or AI, passes the same gates**

```ai-pipeline
Change → Verify → Review → Release → Deploy, with automatic rollback on SLO breach
```

*the delivery loop · 5 gates, 1 automatic way back*

The eight practices below fill in each gate.

## 1. Keep batches small and the default branch green

Agents make it trivial to produce a 3,000-line merge request. Large changes were always risky; with AI they are also unreviewable, because nobody actually reads them.

- **Cap the size of changes.** Set a soft limit on lines changed per merge request (a few hundred is common) and ask agents to split work into steps that can be checked on their own.
- **Short-lived branches, trunk-based flow.** The longer a branch lives, the worse the integration pain. CircleCI's data shows exactly this gap: busy feature branches, a shrinking main branch.
- **Turn on merged results pipelines and [merge trains](https://docs.gitlab.com/ci/pipelines/merge_trains/).** With many concurrent merge requests, each one passing on its own doesn't mean they pass together. A merge train queues them and tests each one against the combined changes ahead of it, before anything reaches the default branch.
- **Separate deploy from release.** Ship unfinished work behind feature flags so it can merge early in small pieces.

## 2. Make verification fast, layered, and hard to fake

Your test suite is now the main reviewer of AI output, so it has to be fast enough to run on every change and strict enough to mean something.

- **Order checks from cheap to expensive.** Formatting, lint, type checks, and secret detection first; unit tests next; integration and end-to-end tests last. Fail fast so agents get feedback in minutes, not hours.
- **Keep the feedback loop under about 10 minutes** for the required jobs. Use `rules:changes` to run only the jobs a change touches, `needs:` to build a DAG instead of waiting for whole stages, and caches for dependencies.
- **Quarantine flaky tests immediately.** Agents retry until things pass. A flaky suite teaches them, and you, to ignore red pipelines.
- **Don't let the same agent grade its own homework.** An agent that writes both the code and the tests can write tests that pass for the wrong reason. Require tests that fail before the fix and pass after, and have humans review test changes, especially deleted or weakened assertions.
- **Scan everything that ships:** dependencies, code (SAST), secrets, container images, and infrastructure-as-code. GitLab ships templates and components for each. AI suggests packages from its training data, including outdated or nonexistent ones, so check that new dependencies actually exist and are maintained.
- **Publish test results as reports.** `artifacts:reports:junit` puts failures right in the merge request, where reviewers (and agents) see them.

## 3. Use AI review as the first pass, and let humans own the merge

AI code review is now cheap and genuinely useful for catching bugs, missing tests, and inconsistent naming. Use it, but be clear about who is accountable.

- **AI reviews first, a person approves.** GitLab Duo's [Code Review Flow](https://docs.gitlab.com/user/duo_agent_platform/) or any other AI reviewer works like a strong linter. The merge decision stays with a human who understands the change.
- **Protect risky paths with Code Owners and approval rules.** Authentication, payments, infrastructure, the pipeline itself (`.gitlab-ci.yml` and any included CI files), and dependency manifests should require approval from the owning team.
- **Label AI-authored changes.** A label or commit trailer for agent merge requests lets you route them to the right reviewers and measure their failure rates separately.
- **Review the tests and the diff, not the summary.** An agent's merge request description says what it *meant* to do. The diff shows what it did.

## 4. Harden the pipeline: it is part of your supply chain

Your CI system holds the keys to production: cloud credentials, registry tokens, signing keys. Attackers know this. The three biggest CI supply-chain incidents of the last 18 months hit GitHub and npm, but every lesson applies to GitLab too.

| Incident | What happened | The lesson for GitLab CI |
| --- | --- | --- |
| [tj-actions/changed-files](https://www.cisa.gov/news-events/alerts/2025/03/18/supply-chain-compromise-third-party-github-action-cve-2025-30066) (March 2025) | Attackers moved a popular GitHub Action's version tags to a malicious commit, which dumped CI secrets into build logs. | A tag can change under you. Pin `include` and CI/CD components to a commit SHA, and images to a digest. |
| [Nx "s1ngularity"](https://wiz.io/blog/s1ngularity-supply-chain-attack) (August 2025) | A privileged workflow ran an unsanitized pull request title as code. The stolen token published malicious npm packages, which used local AI CLIs with flags such as `--dangerously-skip-permissions` to hunt for secrets. Over 1,000 valid GitHub tokens leaked. | Never execute merge request text, keep fork pipelines out of your parent project, and never run AI CLIs with permission checks disabled where secrets live. |
| [Shai-Hulud](https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/) (September 2025) | A self-replicating worm spread through stolen npm tokens; GitHub removed more than 500 compromised packages. | Long-lived publish tokens are a liability. Use trusted publishing with `id_tokens`. |

**What to do, in order of impact** (GitLab's [pipeline security guide](https://docs.gitlab.com/ci/pipeline_security/) covers most of these):

1. **Pin everything you pull in.** GitLab's [components docs](https://docs.gitlab.com/ci/components/) say to "Pin CI/CD components to a specific commit SHA (preferred) or release version tag", and to avoid `~latest`. The same goes for `include: project` and `include: remote`: no versionless includes. Pin Docker images by SHA digest instead of tags like `latest`, and don't build image names from variables.
2. **Use OIDC instead of stored cloud keys.** The [`id_tokens`](https://docs.gitlab.com/ci/secrets/id_token_authentication/) keyword gives each job a short-lived signed token, which expires with the job, that your cloud exchanges for temporary credentials. Give each service its own `aud`, and write cloud trust policies on stable claims such as `project_id`, `namespace_id`, and `ref_protected`, not on usernames.
3. **Keep the job token narrow.** By default, a project's [CI_JOB_TOKEN allowlist](https://docs.gitlab.com/ci/jobs/ci_job_token/) only includes the project itself. Keep it that way, add projects one by one, and use fine-grained job token permissions where you can.
4. **Protect secrets and the jobs that use them.** Prefer an external secrets manager. Otherwise, make variables masked, hidden, and protected, so they are only available to pipelines on protected branches and tags. Prefer typed CI/CD inputs over free-form pipeline variables, and consider disabling pipeline variables altogether.
5. **Keep fork pipelines in the fork.** By default, a [merge request pipeline from a fork](https://docs.gitlab.com/ci/pipelines/merge_request_pipelines/) runs in the fork, with no access to your protected variables or protected runners. Running it in the parent project uses your secrets and runners, so only do it after reading the change, or turn the option off (`ci_allow_fork_pipelines_to_run_in_parent_project`).
6. **Treat merge request text as hostile.** `$CI_MERGE_REQUEST_TITLE`, descriptions, branch names, and commit messages are attacker-controlled. Always quote them, never pass them to `eval` or `sh -c`, and never paste them into an AI prompt in a job that holds secrets (more on that in practice 5).
7. **Publish with trusted publishing and provenance.** npm's [trusted publishing](https://docs.npmjs.com/trusted-publishers) works from GitLab.com shared runners: the job requests an `id_token` with `aud: "npm:registry.npmjs.org"`, so no npm token is stored, and provenance is attached automatically for public packages. npm is also moving to seven-day granular tokens and deprecating classic tokens. Sign your container images with keyless Sigstore signing, which also uses `id_tokens` (`aud: sigstore`).

Here is what that looks like in a `.gitlab-ci.yml`:

```yaml
include:
  # Pin components to a full commit SHA (preferred) or an exact release tag, never ~latest
  - component: $CI_SERVER_FQDN/my-org/security-components/secret-detection@<full-commit-sha>

workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

default:
  image: node:24-alpine@sha256:<digest>      # pin by digest, not by tag

stages: [test, deploy]

test:
  stage: test
  script:
    - npm ci                                   # exact versions from the lockfile
    - npm test
    - echo "Testing: $CI_MERGE_REQUEST_TITLE"  # untrusted: always quoted, never eval'd
  artifacts:
    reports:
      junit: junit.xml                         # results show up in the merge request

deploy:
  stage: deploy
  image: <deploy-image>@sha256:<digest>        # an image with your cloud CLI
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  environment:
    name: production                           # protected environment: approvals live here
  id_tokens:
    AWS_ID_TOKEN:
      aud: https://gitlab.com                  # must match the audience of your AWS OIDC provider
  variables:
    AWS_ROLE_ARN: arn:aws:iam::123456789012:role/deploy
    AWS_WEB_IDENTITY_TOKEN_FILE: /tmp/web-identity-token
  script:
    - echo "$AWS_ID_TOKEN" > "$AWS_WEB_IDENTITY_TOKEN_FILE"
    - ./deploy.sh                              # AWS CLI/SDKs assume the role: no stored keys
```

## 5. Run AI agents inside CI without handing them the keys

Agents now run inside pipelines to triage issues, fix failing pipelines, and review merge requests. That creates a new attack: **prompt injection through CI**. In December 2025, Aikido Security described "[PromptPwnd](https://www.esecurityplanet.com/threats/ai-agents-create-critical-supply-chain-risk-in-github-actions/)", a class of flaws in both GitHub Actions and GitLab CI/CD. A job passes an issue title or merge request description into an agent's prompt while the agent holds a powerful token. An attacker writes instructions into that text, and the agent follows them: leaking secrets, editing the repository, or running commands. eSecurity Planet reported that at least five Fortune 500 companies were affected.

The vulnerable pattern always needs two ingredients: **untrusted text in the prompt** and **privileges in the same job**. Remove either one.

**If you use GitLab Duo Agent Platform flows** such as Fix CI/CD Pipeline or Code Review, they run on runners under a [composite identity](https://docs.gitlab.com/user/duo_agent_platform/security): a dedicated service account with the Developer role, combined with the person who started the flow. GitLab checks both, so the agent can only do what *both* identities are allowed to do. On top of that, use tool-level approval policies (in beta) to require a human to approve sensitive agent actions, and keep the AI audit events for review.

**If you run your own agent CLI in a job** (Claude Code, Codex, or others), build the guardrails yourself:

- **Read-only agent jobs.** The job that runs the agent gets no protected variables, no deploy credentials, and a job token with the narrowest permissions.
- **Writes go through a separate, checked job.** The agent writes its proposed change or comment to an artifact. A later job, which holds the write token, validates it (allowed files, size, format) and applies it, ideally as a merge request a human approves.
- **Allowlist tools.** Give agents only the commands they need. No shell access for a triage bot, and never `--dangerously-skip-permissions` or `--yolo` on a runner that can reach secrets.
- **Treat agent output as untrusted code.** It goes through the same pipeline and review as any other change.
- **Cap spend and turns.** Limit turns, tokens, and job timeout per run so runaway loops end, whether they come from a bug or an attacker.
- **Restrict who can trigger it.** Run agent jobs only for project members, or require a maintainer to add a label or start the job manually (`when: manual`).

## 6. Build once, sign it, and deploy progressively

When more changes arrive, each deploy needs to be cheaper to undo.

- **Build once, promote the same artifact.** The image that passed staging is the exact one that goes to production, referenced by digest, not rebuilt from the same commit. Use protected container tags so only trusted pipelines can push release tags.
- **Sign and verify.** Sign images in CI with keyless Sigstore signing and verify the signature before deploy, so nothing that skipped your pipeline can reach production.
- **Roll out progressively.** Canary or blue-green deploys expose a new version to a small slice of traffic first. Feature flags let you turn behavior off without a redeploy.
- **Roll back automatically.** Tie the rollout to SLOs such as error rate and latency, and let the system roll back without waiting for a human. With CircleCI reporting a median recovery time of 72 minutes, automated rollback is where many teams can win back the most time.
- **Protect production environments.** With [deployment approvals](https://docs.gitlab.com/ci/environments/deployment_approvals/), every job that deploys to a protected environment waits for the required approvals, and by default the person who triggered the pipeline can't approve their own deployment.

## 7. If you ship LLM features, add evals to CI

If your product calls a model, a prompt change is a code change, and a model update can break things without a single line of your code changing. Normal unit tests can't catch "the answers got worse". Evals can.

- **Build a golden dataset.** Start with 20–50 real inputs and the behavior you expect, and grow it from production failures. The dataset matters more than the tool.
- **Deterministic checks first.** Valid JSON, required fields, forbidden content, length limits, and tool calls with the right arguments are cheap and stable. Use model-graded ("LLM-as-judge") checks only where you need them, because they are slower, costlier, and noisier.
- **Gate on thresholds, not exact matches.** Outputs vary, so fail the pipeline when a score drops below a set level or regresses against the default branch.
- **Trigger on everything that changes behavior.** Use `rules:changes` on prompts, model version, temperature, retrieval settings, and tool definitions.
- **Pin model versions** and treat an upgrade like a dependency bump, with an eval run before it merges.
- **Keep watching in production.** Score a sample of real traffic, because offline evals can't catch everything.

Tools such as promptfoo, Braintrust, and LangSmith can output JUnit XML, so with `artifacts:reports:junit` eval results show up in the merge request next to your other tests. Guides such as [this one from Braintrust](https://www.braintrust.dev/articles/llm-eval-pipeline-github-actions) walk through the setup; the steps map directly to a GitLab job.

## 8. Measure delivery, not activity

AI makes activity metrics such as commits, lines of code, and pipeline runs meaningless overnight. Measure outcomes instead.

**DORA's five delivery metrics** ([dora.dev](https://dora.dev/guides/dora-metrics/)):

| Group | Metric | What it measures |
| --- | --- | --- |
| Throughput | Change lead time | From commit to running in production |
| Throughput | Deployment frequency | How often you deploy |
| Throughput | Failed deployment recovery time | How long it takes to recover from a failed deployment |
| Instability | Change fail rate | Share of deployments that need a rollback or hotfix |
| Instability | Deployment rework rate | Share of deployments that are unplanned, triggered by a production incident |

**Add a few AI-era signals:**

- **Default-branch pipeline success rate and time to green**, the numbers CircleCI saw getting worse.
- **Change fail rate for AI-authored vs. human-authored changes.** This is where the labels from practice 3 pay off.
- **Review time and merge request size.** If reviews get faster while merge requests get bigger, people have stopped reading.
- **Agent cost per merged change**, so agent spend stays tied to shipped value.

DORA's other finding is worth repeating: the teams that benefit from AI have good platforms underneath. In the 2025 report, 90% of organizations had at least one internal platform, and platform quality was directly linked to getting value from AI. A paved road that makes the secure, tested path the easy one is the best AI investment most teams can make. In GitLab, that road is usually a set of shared, versioned CI/CD components that every project includes.

## Checklist

**Pipeline basics**

- [ ] Required jobs finish in about 10 minutes, ordered cheap to expensive
- [ ] Flaky tests are quarantined, not retried until green
- [ ] Merge request size limits, merged results pipelines, and merge trains are on
- [ ] Feature flags separate deploy from release

**Supply chain**

- [ ] Every `include` and CI/CD component is pinned to a commit SHA or exact tag; images are pinned by digest
- [ ] Cloud access uses `id_tokens` (OIDC); no long-lived keys in CI/CD variables
- [ ] The job token allowlist only contains projects that need access
- [ ] Secrets are protected, masked, and hidden, or live in an external secrets manager
- [ ] Fork pipelines stay in the fork; merge request text is never executed
- [ ] Packages publish with trusted publishing and provenance; images are signed

**Agents in CI**

- [ ] Agent jobs get no protected variables or deploy credentials
- [ ] Agent writes go through a separate validated job or merge request
- [ ] Tool allowlists, approval policies, and cost limits are set; no permission-skipping flags

**Release and measurement**

- [ ] One signed artifact is promoted through every environment
- [ ] Production is a protected environment with deployment approvals
- [ ] Canary rollout with automatic rollback on SLOs
- [ ] LLM features have evals gating prompt and model changes
- [ ] DORA's five metrics are tracked, plus AI-authored change fail rate

## Sources

Checked on October 24, 2026.

- [Announcing the 2025 DORA report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) — Google Cloud, September 24, 2025
- [DORA's software delivery performance metrics](https://dora.dev/guides/dora-metrics/) — DORA
- [5 key takeaways from the 2026 State of Software Delivery](https://circleci.com/blog/five-takeaways-2026-software-delivery-report) — CircleCI, February 18, 2026
- [More code, less delivery](https://blog.robbowley.net/2026/04/02/more-code-less-delivery-but-does-the-circleci-2026-report-really-show-1-in-20-teams-are-benefiting/) — Rob Bowley, a critique of the CircleCI report
- [Supply chain compromise of third-party GitHub Action (CVE-2025-30066)](https://www.cisa.gov/news-events/alerts/2025/03/18/supply-chain-compromise-third-party-github-action-cve-2025-30066) — CISA
- [s1ngularity: supply chain attack leaks secrets on GitHub](https://wiz.io/blog/s1ngularity-supply-chain-attack) — Wiz
- [Our plan for a more secure npm supply chain](https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/) — GitHub, September 22, 2025
- [AI agents create critical supply chain risk in GitHub Actions](https://www.esecurityplanet.com/threats/ai-agents-create-critical-supply-chain-risk-in-github-actions/) — eSecurity Planet, on Aikido's PromptPwnd research
- [Pipeline security](https://docs.gitlab.com/ci/pipeline_security/) — GitLab Docs
- [CI/CD components](https://docs.gitlab.com/ci/components/) — GitLab Docs
- [OpenID Connect (OIDC) authentication using ID tokens](https://docs.gitlab.com/ci/secrets/id_token_authentication/) — GitLab Docs
- [CI/CD job token](https://docs.gitlab.com/ci/jobs/ci_job_token/) — GitLab Docs
- [Merge request pipelines (including forks)](https://docs.gitlab.com/ci/pipelines/merge_request_pipelines/) — GitLab Docs
- [Merge trains](https://docs.gitlab.com/ci/pipelines/merge_trains/) — GitLab Docs
- [Deployment approvals](https://docs.gitlab.com/ci/environments/deployment_approvals/) — GitLab Docs
- [GitLab Duo Agent Platform](https://docs.gitlab.com/user/duo_agent_platform/) and [its authentication and authorization](https://docs.gitlab.com/user/duo_agent_platform/security) — GitLab Docs
- [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers) — npm Docs
- [Building an LLM eval pipeline with GitHub Actions](https://www.braintrust.dev/articles/llm-eval-pipeline-github-actions) — Braintrust
