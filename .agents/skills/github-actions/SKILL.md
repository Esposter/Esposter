---
name: github-actions
description: Esposter GitHub Actions authoring conventions for `.github/workflows` and `.github/actions` — taking the runner's own affordance over a shell reimplementation of it (`working-directory:`, `if:`, `env:`, a composite action), every `${{ }}` expansion of event/matrix/input data reaching the shell as an `env:` variable read as `"$VAR"` rather than interpolated into the command line, a reusable workflow called with named secrets rather than `secrets: inherit` and declaring each `required` so the unpinnable caller's drift fails the call, a skipped job satisfying its required check so an aggregate gate needs `!cancelled()` plus an explicit `needs.*.result` step, a cleanup step's `always()` being paired with a guard on the value it consumes, and a comment keeping only what the owning docs page does not say. Apply when writing or editing any workflow, composite action, job, or step — and read the owner pointers before adding a rule, since caching, job shape, permissions, action pinning and which pnpm script a job runs each belong elsewhere.
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

A `${{ }}` expansion is substituted into the script **before** any shell parsing, so event, matrix and input data interpolated into a command line is that data becoming command syntax. Every one goes into the step's `env:` and is read as a quoted `"$VAR"`:

```yaml
- name: ✅ ${{ matrix.name }}
  env:
    SCRIPT: ${{ matrix.script }}
  run: pnpm "$SCRIPT"
```

A `${{ }}` is fine in a field the shell never sees — `if:`, `name:`, `with:`, `working-directory:`, `key:` — and fine inline when the expression can only ever yield a literal the workflow wrote itself, as a boolean input rendering a flag: `pnpm … ${{ inputs.force == true && '--force' || '' }}`.

## A reusable workflow is called with named secrets, never `secrets: inherit`

Inheritance hands the callee every secret the caller can see, which is the repository's whole set — here that includes the Azure and Pulumi credentials that deploy the estate, alongside whichever two a given callee actually reads. And a callee is a file, so it lives on a branch: a call pinned to a mutable ref makes that whole set reachable from anything later pushed to the ref. The call therefore lists what the callee reads, and the callee declares each one under `on.workflow_call.secrets` with `required: true`, which turns a secret the caller failed to map into a call GitHub refuses rather than an empty token in the step that spends it.

What a list costs is that the two files have to agree, and the caller is the copy that cannot be pinned — GitHub reads a trigger file from the ref the event names, so a mismatch shows up on some events and not others. Where that is the shape, a test holds the pair, because nothing in either file can import the other (`ReviewCollector.yaml` and `run-review-collector.yaml`, held by `scripts/src/services/coderabbit/collect/constants.test.ts`).

## A skipped job reports its required check as satisfied

This is the failure mode worth knowing by heart: a job that `needs` a failed job is **skipped**, and a skipped required check is green. So a gate job that means "every shard passed" goes green precisely when a shard did not.

An aggregate gate therefore takes `if: ${{ !cancelled() }}` — not `always()`, which turns a cancelled run into a failure — and re-asserts the dependency as its own first step, before any setup:

```yaml
- name: 🚦 Gate on the shard results
  if: ${{ contains(needs.*.result, 'failure') }}
  run: exit 1
```

## `always()` is paired with a guard on what the step consumes

A cleanup step that must run on failure (`always()`) runs on _every_ failure — including one that happened before the value it cleans up was ever produced. Unguarded, it replaces the real error with its own argument-parsing one. Gate it on the value, not just on the outcome: `if: ${{ always() && steps.<id>.outputs.<name> != '' }}`.

## Don't swallow an exit code to make a step idempotent

`|| true` on a command that is _already_ idempotent is dead syntax that can only ever hide a real failure — a revoked role, a resource mid-delete — which then resurfaces one step later as something that reads like a different bug. Check whether the tool is idempotent before reaching for it (`az storage container create` is: an existing container is `created: false`, exit 0).

## A comment keeps what the owning page does not say

The argument for a job's shape lives in the page that owns it (below); a workflow comment that carries it a second time drifts the moment the page moves. The file header names the page, and each step's comment keeps only what a reader could not get from there or from the step itself — an ordering constraint (`GITHUB_ENV` reaches only the steps after it), a platform quirk (`ubuntu-26.04` for bwrap >= 0.10.0), a gate's failure mode (a `path` list that drifted still reports a hit).

## Owned elsewhere — pointers, not copies

- **Which pnpm script a job runs, and how it is invoked** (the root script over the binary, bare `pnpm <script>` over `pnpm run <script>`, never the `-- <args>` separator) — `package-scripts`.
- **Pinning a third-party action to a dereferenced commit SHA with its `# vX.Y.Z` comment, and bumping one** — `dependency-updates`.
- **Job shape, the build caches, why a gate reads the disk rather than `cache-hit`, per-job `permissions`, and why `.github/workflows/` is flat** — `apps/web/content/docs/architecture/monorepo-tooling.md`.
- **The review collector's own workflows** — the pinned `@ai/queue` call, the triggers, the retrigger job — `apps/web/content/docs/infra/review-collector/runner.md`.
