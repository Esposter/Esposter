---
name: running-checks
description: Apply when about to run pnpm typecheck, lint, lint:fix, test, format, build, coverage or bench in any package, when deciding which checks a change owes before its push, and whenever you find yourself waiting on a check's output. Esposter's split between the session and CI — the session runs only the tests of what it touched, in the background, once after all the edits going out together, and CI runs typecheck, lint, format and the whole suite on the push, its red answered by the collector's repair.
---

# Running Checks

**CI runs the checks; a session runs only the tests of what it touched.** Every push to `ai/queue` runs typecheck,
lint, format and the whole suite, and a red that reaches `main` is the collector's repair — its regenerators
first, then a session (`apps/web/content/docs/infra/review-collector/repair.md`). The pre-commit hook formats what
is staged (`.githooks/pre-commit`). The command and its directory are the `package-scripts` skill's; this page is
which checks a session runs and how it waits on them.

## Settled — do not re-propose

- **Typecheck and lint before a push.** CI runs both on every push at no session cost, while locally each took
  minutes per change and the root type-aware lint outgrew WSL's memory on this repository. Nothing waits on them
  either way: the push already went out beside them, so a local run only moved the finding earlier by the length of
  a CI run, at the session's price.
- **Dropping the touched tests with them.** Their cost scales with the change rather than the repository, and they
  catch what neither a typecheck nor a lint can — the behaviour the change was for.

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

## A check CI owns, run locally

Only to answer a red: a session asked to fix a failed CI job, or the repair's own session, runs that one check as
CI runs it, to reproduce the red and prove the fix. A check that writes — `lint:fix`, `pnpm format` — owns the files
it covers until its exit line, so nothing is edited under it meanwhile.

## Reading the result

The verdict is the exit line appended to the log — never a grep of the output, never the notification's exit code, never a pipeline's — and a red result is an edit then a fresh background run (`references/reading-results.md`).

## Reference pages

- `references/reading-results.md` — when a backgrounded check finishes and its verdict is read.
