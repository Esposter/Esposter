# Running the Suite and Reading Its Failures

How to read a failure the targeted run doesn't produce. **The full run itself belongs to CI** — running it locally is banned (see the skill's "Running Tests"), so this page is about failures CI reports back, not about reproducing them by sweeping everything.

## What only the full parallel run catches

A green targeted run can hide **collateral damage from shared global state**. A sweep or mutation that is safe on an isolated, serial resource (a per-key cache dir) is catastrophic on a shared, concurrent one (the global `os.tmpdir()`, a shared registry): it deletes or corrupts a live sibling test's state. Treat any "another test's temp vanished" failure as your own regression, never flakiness.

This is the one risk targeted runs carry, and it is bounded: it only applies to a change that writes to a process-global resource. When a change does that, name the suites sharing that resource as extra path arguments rather than running everything — and otherwise let CI be the one to find it.

## A full-run timeout is not automatically a regression

Heavy seeded tests can blow the default timeout purely from full-suite parallel load. Rerun the file in isolation first: if it passes comfortably there and CI is green, leave it alone — **never** bump `testTimeout` or add a per-test `{ timeout }` to paper over machine load.

## Environment

Tests run on Windows: `configuration/modules.ts` allowlists a minimal set of Nuxt modules under `process.env.VITEST`, so a test needing an excluded module adds it to that branch.
