# Reading a Check's Result

Read when a backgrounded check has finished and its verdict is being read.

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
