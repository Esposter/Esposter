---
name: github-actions
description: Apply when writing or editing any workflow, composite action, job, or step — and read the owner pointers before adding a rule, since caching, job shape, permissions, action pinning and which pnpm script a job runs each belong elsewhere. Esposter GitHub Actions authoring conventions for `.github/workflows` and `.github/actions` — the runner's own affordance over a shell reimplementation, template data reaching the shell only through `env:`, `secrets: inherit` on a reusable workflow, a skipped job satisfying its required check, `always()` paired with a guard, every schedule quoted in UTC on minute 16, and a comment keeping only what the owning page does not say.
---

# GitHub Actions Authoring

How a workflow file or composite action is written here. **What the CI does** — which jobs exist, the two content-hash caches, the `package-builds` artifact, the shard count, per-job permissions — is `apps/web/content/docs/architecture/monorepo-tooling.md`'s, under `## CI job shape` and `## CI security`. This skill is only the shape of a step.

## Take the runner's affordance, not a shell reimplementation of it

The runner already says most of what a step needs, declaratively, where the UI and the next reader can see it. A shell form that says the same thing works — which is exactly why it accumulates.

- `working-directory:` rather than a `cd … &&` chain.
- `if:` rather than a guard inside `run`.
- `env:` rather than an inline `VAR=… cmd` assignment.
- A composite action under `.github/actions/` rather than the same block pasted into a second workflow.
- A `matrix` whose entries carry their own `name` rather than two jobs differing by one word (`check` in `CI.yaml` is Lint and Typecheck).

The exception is a value the runner cannot hold: a multi-line heredoc, or a `$GITHUB_OUTPUT` write, is shell because there is no field for it.

## Template data reaches the shell through `env:`, never the command line

Event, matrix and input data reach `run` through the step's `env:` as a quoted `"$VAR"`, never a `${{ }}` on the command line (`references/template-data.md`).

## A reusable workflow that spends secrets inherits them

`secrets: inherit`, never a named list the callee must mirror (`references/reusable-workflows.md`).

## A skipped job reports its required check as satisfied

An aggregate gate takes `if: ${{ !cancelled() }}` and re-asserts its needs' results first, since a skipped required check is green (`references/gates-and-cleanup.md`).

## `always()` is paired with a guard on what the step consumes

`always()` is paired with a guard on the value the step consumes (`references/gates-and-cleanup.md`).

## A schedule is a quoted UTC string on minute 16

Every cron is a quoted UTC string firing on minute 16, its comment giving the cadence and why, never a local time (`references/schedules.md`).

## Don't swallow an exit code to make a step idempotent

`|| true` on a command that is _already_ idempotent is dead syntax that can only ever hide a real failure — a revoked role, a resource mid-delete — which then resurfaces one step later as something that reads like a different bug. Check whether the tool is idempotent before reaching for it (`az storage container create` is: an existing container is `created: false`, exit 0).

## A comment keeps what the owning page does not say

The argument for a job's shape lives in the page that owns it (below); a workflow comment that carries it a second time drifts the moment the page moves. The file header names the page, and each step's comment keeps only what a reader could not get from there or from the step itself — an ordering constraint (`GITHUB_ENV` reaches only the steps after it), a platform quirk (`ubuntu-26.04` for bwrap >= 0.10.0), a gate's failure mode (a `path` list that drifted still reports a hit).

## Owned elsewhere — pointers, not copies

- **Which pnpm script a job runs, and how it is invoked** (the root script over the binary, bare `pnpm <script>` over `pnpm run <script>`, never the `-- <args>` separator) — `package-scripts`.
- **Pinning a third-party action to a dereferenced commit SHA with its `# vX.Y.Z` comment, and bumping one** — `dependency-updates`.
- **Job shape, the build caches, why a gate reads the disk rather than `cache-hit`, per-job `permissions`, and why `.github/workflows/` is flat** — `apps/web/content/docs/architecture/monorepo-tooling.md`.
- **The review collector's own workflows** — the pinned `@ai/queue` call, the triggers, the retrigger job — `apps/web/content/docs/infra/review-collector/runner.md`.

## Reference pages

- `references/template-data.md` — when a `run` needs event, matrix or input data.
- `references/reusable-workflows.md` — when calling a reusable workflow that reads secrets.
- `references/gates-and-cleanup.md` — when writing an aggregate gate or a cleanup step that runs on failure.
- `references/schedules.md` — when adding or changing a `schedule`.
