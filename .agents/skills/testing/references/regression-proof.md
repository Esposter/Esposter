# Regression Tests

Read when a regression test is about to be kept, and the end-of-work run has to be made with its fix reverted.

- **A regression test is proven to fail before it is kept** — the one end-of-work run (the `running-checks` skill) is made with the fix it guards reverted, the test is watched failing for the reason it names, and the fix is restored only after that run's exit line is in its log, never while it is still in flight, since a test file imported after the restore runs the fixed code; the commit follows the restore. No second run follows the restore. A test that has only passed against fixed code has shown that it passes; the un-awaited form in `references/awaiting-a-double.md` is the same step for an ordering contract.
