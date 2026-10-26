---
name: github-actions
description: Apply when writing or editing any workflow, composite action, job, or step — and read the owner pointers before adding a rule. Esposter's GitHub Actions authoring for `.github/workflows` and `.github/actions`: how a step is written.
---

# GitHub Actions Authoring

How a workflow file or composite action is written here. **What the CI does** — which jobs exist, the traced task cache, the `package-builds` artifact, the shard count, per-job permissions — is `openspec/specs/architecture/monorepo-tooling/design.md`'s, under `## CI job shape` and `## CI security`. This skill is only the shape of a step.

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

Don't append `|| true` to a command the tool already makes idempotent (`references/exit-codes.md`).

## A comment keeps what the owning page does not say

A workflow comment keeps only what the owning page and the step itself leave unsaid (`references/step-comments.md`).

## Owned elsewhere — pointers, not copies

- **Whether a workflow parses at all** — `vp run lint:workflows`, actionlint as a leaf of the root `vp run lint` (`openspec/specs/architecture/monorepo-tooling/design.md`, "Workflow lint").
- **Which pnpm script a job runs and how it is invoked** — the `package-scripts` skill ("Key Rules").
- **Pinning a third-party action to a dereferenced commit SHA with its `# vX.Y.Z` comment, and bumping one** — the `dependency-updates` skill (`references/github-actions.md`).
- **Job shape, the build caches, why a gate reads the disk rather than `cache-hit`, per-job `permissions`, and why `.github/workflows/` is flat** — `openspec/specs/architecture/monorepo-tooling/design.md`.
- **Adding a third-party action** — its `owner/repo@*` goes into `patternsAlloweds` in `apps/infra/src/github/actionsPermissions.ts` in the same change, or GitHub refuses the whole workflow at startup (`openspec/specs/architecture/monorepo-tooling/design.md`, "Allowed actions").
- **The review's own workflow**, `.github/workflows/Review.yaml` (`pnpm -C scripts ai:review`, and `ai:review:fix` in its fix matrix) — the `review-queue` skill, and `openspec/specs/infra/review/design.md`.

## Reference pages

- `references/template-data.md` — when a `run` needs event, matrix or input data.
- `references/reusable-workflows.md` — when calling a reusable workflow that reads secrets.
- `references/gates-and-cleanup.md` — when writing an aggregate gate or a cleanup step that runs on failure.
- `references/schedules.md` — when adding or changing a `schedule`.
- `references/exit-codes.md` — when a step's command can fail and a `|| true` is about to be written.
- `references/step-comments.md` — when writing or reviewing a comment in a workflow or composite action.
