---
name: running-checks
description: Apply when about to run pnpm typecheck, lint, lint:fix, test, format, build, coverage or bench in any package, when deciding when in a task to run one, and whenever you find yourself waiting on a check's output. Esposter rules for running any check — every check goes out with run_in_background true while the session keeps editing, independent ones fire in one block, a foreground poll of a backgrounded check is banned, blocking is correct only when commit or push is the sole step left, one verification pass batched after every edit going out, the verdict is the exit code read from the log, and a red result is a new edit followed by a new background run.
---

# Running Checks

**Every check is a background task, and the session keeps working while it runs.** This skill exists because the
rule is broken by default: a check looks like a step to wait on, and the tell is a turn that ran a three-minute
typecheck, waited, ran a three-minute lint, waited, and produced no edits in between. The command and its
directory are the `package-scripts` skill's; this page is only _when_ a check runs and _how_ the session waits.

## Every check goes out with `run_in_background: true`

Every check is minutes long — the `apps/web` typecheck and the root oxlint pass each take several, a Nuxt suite
about one — and none of them needs supervision. So each one is a `Bash` call with `run_in_background: true`, redirecting its
output to a log file and appending its own exit code (`echo "exit $?" >> log`), and the session moves to the next
piece of work: the next unit's edits, the commit message, the docs sweep, the ledger row. The harness delivers a
completion notification; read the log then.

**This holds for a one-package, one-suite, "quick" check too.** A scripts typecheck is seconds, and running it in the
foreground still costs the turn; the habit that survives is the one applied without weighing it. The only checks
that run in the foreground are `pnpm format` (seconds, and every later step reads its output) and a `git` command.

**A check that writes owns the tree while it runs.** `pnpm format` and `lint:fix` read each file and write the fixed copy back, so an edit landing between the two is silently overwritten by the stale copy — and the root `lint:fix` holds files for minutes. While one runs, the session edits nothing it covers: it drafts the commit message, reads, or works in the scratchpad, and resumes editing once the run's log has its exit line. Typecheck and the tests only read, so they leave the tree free.

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
startup cost twice (`AGENTS.md`, "Finishing a change").

## Reading the result

**The verdict is the exit code, never a grep of the output.** The root lint script aggregates one leaf per tool
and every leaf runs, so a passing one prints `Found 0 warnings and 0 errors` above the one that failed and the
tail of the log belongs to whichever finished last (`oxlint` skill). Read the appended exit line first, then the
log for what failed — all of it, since the point of the aggregate is that there may be more than one.

**The exit code is the one in the log, never the one the completion notification carries.** The shape this page
asks for — `(cmd > log 2>&1; echo "exit $?" >> log)` — makes the subshell's status the `echo`'s, so the
notification says exit code 0 for a check that failed, every time. It is the more prominent of the two numbers
and it arrives without being asked for, which is what makes it worth naming: a red typecheck read this way is a
green light to keep building on the change that broke it, and the next check says the same thing.
So open the log. `tail -1` is the appended line; anything else is the command's own output and proves nothing. For the same reason a check is never piped into `tail` and several are never chained with `&&` in one call: a pipeline's status is the last command's, so the appended line describes `tail`, and every later link in the chain runs on top of a failure that was never read.

**A red result is an edit, then a fresh background run** — of that check alone when the fix cannot reach the others,
of the full pass when it can. Never hand-fix what `lint:fix` fixes, and never chase an error in a file the change
never touched before diffing against a clean tree (`context-efficiency`).
