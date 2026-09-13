---
name: running-checks
description: Esposter rules for running any check — pnpm format, typecheck, lint, lint:fix, test, build, coverage, bench, or a package's own script — every check goes out with run_in_background true and the session keeps editing, the independent ones fire in one block, a foreground poll of a backgrounded check is banned, blocking is correct only when commit or push is the sole step left, one verification pass batched after every edit going out rather than one per chunk, the verdict is the exit code read from the log rather than a grep of its tail, and a red result is a new edit followed by a new background run. Apply the moment you are about to run pnpm typecheck, lint, lint:fix, test, format, build, coverage or bench in any package, before deciding when in a task to run it, and whenever you find yourself waiting on a check's output.
---

# Running Checks

**Every check is a background task, and the session keeps working while it runs.** This skill exists because the
rule is broken by default: a check looks like a step to wait on, and the tell is a turn that ran a three-minute
typecheck, waited, ran a three-minute lint, waited, and produced no edits in between. Which command to run and
from where is the `package-scripts` skill; this page is only _when_ a check runs and _how_ the session waits.

## Every check goes out with `run_in_background: true`

Every check is minutes long — `apps/web` typecheck ~3.5 min, the root oxlint pass ~3 min, a Nuxt suite ~1 min —
and none of them needs supervision. So each one is a `Bash` call with `run_in_background: true`, redirecting its
output to a log file and appending its own exit code (`echo "exit $?" >> log`), and the session moves to the next
piece of work: the next unit's edits, the commit message, the docs sweep, the ledger row. The harness delivers a
completion notification; read the log then.

**This holds for a one-package, one-suite, "quick" check too.** A scripts typecheck is seconds, and running it in the
foreground still costs the turn; the habit that survives is the one applied without weighing it. The only checks
that run in the foreground are `pnpm format` (seconds, and every later step reads its output) and a `git` command.

**Fire the independent ones in one block** so they run concurrently: typecheck, lint and the touched suites do not
feed each other, so they go out as separate background calls in a single response. A check whose result changes
the next one — a `lint:fix`, then the same lint again — is the one case where the second waits on the first.

## Never poll a backgrounded check

A foreground poll of a backgrounded check is a foreground check: `for i in $(seq 1 40); do grep -q done log && break;
sleep 10; done` spends the turn the flag was meant to save, and the session made no edits while it ran. A
backgrounded check announces its own completion. The wait-on-a-condition loop in `context-efficiency` is for an
**external** process the harness cannot see finish — a dev server, a deploy — never for a check.

**Blocking is correct only when the sole remaining step is commit, merge or push.** That is rare by construction:
the checks are the last step, so there is almost always work ahead of them that does not depend on their result.
When it genuinely is the last step, end the turn with a one-line status and let the notification re-enter.

## One verification pass, after every edit going out

Batch format → typecheck → lint:fix → tests until **all** edits are done. Each pass re-pays a fixed startup cost, so
per-chunk checking multiplies it for no extra signal — nothing is learned at chunk 3 that chunk 7 won't also reveal.

**"All edits" means everything going out together, not the sub-task in front of you.** A session covering several
units, several files or several ledgers checks once across the lot — a unit finished at noon and a unit finished at
three are one pass. Sub-task boundaries feel like natural checkpoints and are the commonest way this rule gets
misread: the tell is a check whose diff is one file, or a formatter run after a single-line edit. Commit per
coherent chunk regardless — commits are cheap and protect against other sessions' resets, checks are not.

The pass runs **after** the review's quality lane, not before — cleanup edits code, so checking first pays the
startup cost twice (`CLAUDE.md`, "Finishing a change").

## Reading the result

**The verdict is the exit code, never a grep of the output.** The root lint script is three commands chained with
`&&`, each printing its own summary, and the two that pass print `Found 0 warnings and 0 errors` above the one that
failed (`oxlint` skill). Read the appended exit line first, then the log for what failed.

**A red result is an edit, then a fresh background run** — of that check alone when the fix cannot reach the others,
of the full pass when it can. Never hand-fix what `lint:fix` fixes, and never chase an error in a file the change
never touched before diffing against a clean tree (`context-efficiency`).
