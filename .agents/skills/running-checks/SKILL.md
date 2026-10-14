---
name: running-checks
description: Apply when about to run pnpm typecheck, lint, lint:fix, test, format, build, coverage or bench in any package, when deciding which checks a change owes before its push, and whenever you find yourself waiting on a check's output. Esposter's split between the session and CI — the session runs only the tests of what it touched, in the background, once after all the edits going out together, and CI runs typecheck, lint, format and the whole suite on the push, the session watching that run and fixing a red typecheck or lint itself.
---

# Running Checks

**CI runs the checks; a session runs only the tests of what it touched.** Every push to `ai/queue` runs typecheck,
lint, format and the whole suite. The session does not watch its push's run unless the user asks for verification;
then it fixes a red typecheck or lint job itself, in a commit behind the push (`AGENTS.md`, "Finishing a change", step 6). The pre-commit hook only formats what is staged and
runs no check (`.githooks/pre-commit`); it re-adds each staged file whole from the working copy, so a partial stage of
a file commits all of it, and a commit is split by file or with the other hunks kept out of the working copy. The command and its directory are the `package-scripts` skill's; this page is
which checks a session runs and how it waits on them.

## Settled — do not re-propose

- **Typecheck and lint before a push.** CI runs them on every push at no session cost, while a local run takes
  minutes per change and the root type-aware lint needs more memory than WSL gives it here. Nothing waits on them
  either way: the push already went out beside them, so a local run only moved the finding earlier by the length of
  a CI run, at the session's price.
- **Dropping the touched tests with them.** Their cost scales with the change rather than the repository, and they
  catch what neither a typecheck nor a lint can — the behaviour the change was for.
- **Lint, a typecheck or any other check in the pre-commit hook.** Checks stay in CI, which runs them on every push; the
  pre-commit hook only formats, so no commit waits on a check.
- **A Pulumi apply.** `pnpm typecheck` in `apps/infra` runs before `infra:up`, since an apply reaches Azure and CI runs after it.

## The tests of what the change touched, in the background

The tests are one `Bash` call with `run_in_background: true`, redirecting their output to a log file and appending
their own exit code (`echo "exit $?" >> log`), and the session moves to the next piece of work: the commit message,
the docs sweep, the ledger row. The harness delivers a completion notification; read the log then. **This holds for
a one-file, "quick" suite too** — the habit that survives is the one applied without weighing it.

Which paths, and from which directory, are the `package-scripts` skill's `references/check-suite.md`: the suites
of the files touched, a bundle's size snapshot after a fresh `pnpm build`, and the docs suite for a docs edit.

## Never poll a backgrounded check

A foreground poll of a backgrounded check is a foreground check: `for i in $(seq 1 40); do grep -q done log && break;
sleep 10; done` spends the turn the flag was meant to save. A backgrounded check announces its own completion. The
wait on a condition in the `context-efficiency` skill ("Wait on a condition, never a sleep") is for an **external**
process the harness cannot see finish — a dev server, a deploy — never for a check.

**Blocking is correct only when the sole remaining step is commit, merge or push.** When it genuinely is the last
step, end the turn with a one-line status and let the notification re-enter.

## One run, after all the edits going out

The tests run once, after **all** edits going out together — not per sub-task, not per unit. Each run re-pays a
fixed startup cost, and nothing is learned at chunk 3 that chunk 7 won't also reveal. Commit per coherent chunk
regardless: commits are cheap and protect against other sessions' resets, checks are not. The run follows the
review's quality lane, since cleanup edits code (`AGENTS.md`, "Finishing a change").

## Watching the push's run, when asked

Watching waits for the user to ask for verification; it does not start on its own after a push. Then
`pnpm ai:ci:watch`, in the background. It finds the run by the tip's commit — never by
`--branch` with `--workflow`, whose per-workflow filter answers `ai/queue` with weeks-old runs — follows a run that
was skipped while it waited to the newer run that carries the commit too (`concurrency` in `CI.yaml` keeps only the
newest waiting run), waits for it, and exits non-zero on a red with each failed job's error lines, which is what wakes
the session to fix it. A wave of agents landing one after another is watched once, after the last landing.

## A check CI owns, run locally

Only to answer a red: a session whose push turned a typecheck or lint job red, a session asked to fix a failed CI
job, runs that one check as CI runs it, to reproduce the red and prove the fix. The
failed job's log (`gh run view <id> --log-failed`) names the package whose typecheck failed, the root's own
included, and the reproduction is `pnpm typecheck` from that package rather than the whole repository; a lint red is
reproduced by `vp run lint:fix` from the repo root, the one scope matching CI's
(the `package-scripts` skill's `references/check-suite.md`). A check that writes — `lint:fix`, `pnpm format` — owns
the files it covers until its exit line, so nothing is edited under it meanwhile. A worktree installed without the app has no `apps/web/.nuxt`, and every package's ESLint config imports `withNuxt` from the `eslint.config.mjs` Nuxt generates there, so ESLint cannot load until the shared checkout's is linked in: `ln -s "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/apps/web/.nuxt" apps/web/.nuxt` from the worktree's root. Node resolves the generated file's relative imports from the link's real path, so they reach the shared checkout's installs. On Windows, long paths must be enabled once (see monorepo-tooling.md, Windows long paths), or `vp lint` fails on a worktree's deep node_modules; a worktree lives at `.agents/worktrees/<lane>`.

## Reading the result

The verdict is the exit line appended to the log — never a grep of the output, never the notification's exit code, never a pipeline's — and a red result is an edit then a fresh background run (`references/reading-results.md`).

## Reference pages

- `references/reading-results.md` — when a backgrounded check finishes and its verdict is read.
