# Running the Suite and Reading Its Failures

Why the full run is the one that counts, and how to read a failure that the targeted run doesn't produce.

## Run the full suite, not just your new file

A green targeted run hides regressions the full parallel run catches — above all **collateral damage from shared global state**. A sweep or mutation that is safe on an isolated, serial resource (a per-key cache dir) is catastrophic on a shared, concurrent one (the global `os.tmpdir()`, a shared registry): it deletes or corrupts a live sibling test's state. Treat any "another test's temp vanished" failure as your own regression, never flakiness.

## A full-run timeout is not automatically a regression

Heavy seeded tests can blow the default timeout purely from full-suite parallel load. Rerun the file in isolation first: if it passes comfortably there and CI is green, leave it alone — **never** bump `testTimeout` or add a per-test `{ timeout }` to paper over machine load.

## Environment

Tests run on Windows: `configuration/modules.ts` allowlists a minimal set of Nuxt modules under `process.env.VITEST`, so a test needing an excluded module adds it to that branch.
