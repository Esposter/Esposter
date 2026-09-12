# Running the Suite and Reading Its Failures

How to narrow a run by name or path without paying for the whole suite, and how to read a failure the targeted run does not produce. **The full run itself belongs to CI** — running it locally is banned (see the skill's "Running Tests"), so this page is about the flags a narrowed run takes and the failures CI reports back, not about reproducing them by sweeping everything.

## What only the full parallel run catches

A green targeted run can hide **collateral damage from shared global state**. A sweep or mutation that is safe on an isolated, serial resource (a per-key cache dir) is catastrophic on a shared, concurrent one (the global `os.tmpdir()`, a shared registry): it deletes or corrupts a live sibling test's state. Treat any "another test's temp vanished" failure as your own regression, never flakiness.

This is the one risk of _this_ page's kind — collateral damage a green targeted run cannot show you — and it is bounded: it only applies to a change that writes to a process-global resource. It is not the only thing a targeted run misses; an unselected caller or integration path is missed too, and CI is what covers those. When a change does that, name the suites sharing that resource as extra path arguments rather than running everything — and otherwise let CI be the one to find it.

## A full-run timeout is not automatically a regression

Heavy seeded tests can blow the default timeout purely from full-suite parallel load. Rerun the file in isolation first: if it passes comfortably there and CI is green, leave it alone — **never** bump `testTimeout` or add a per-test `{ timeout }` to paper over machine load.

## Environment

Tests run on Windows: `configuration/modules.ts` allowlists a minimal set of Nuxt modules under `process.env.VITEST`, so a test needing an excluded module adds it to that branch.

The host is Windows but the runner is not: `pnpm test` goes through `virrun`, whose win32 backend executes vitest inside WSL, so `process.platform` reads `linux` while `pnpm build` ran natively. Anything gated on `process.platform` is therefore selected by the sandbox rather than by the host — see `references/platform-and-bundle-tests.md` for the one suite this makes fail locally by design.

The sandbox carries no repository either: `.git` is not mounted into it, so a test that shells out to git (`git ls-files`, `git rev-parse`) fails locally with `fatal: not a git repository` while passing in CI, whose native backend runs against the real checkout. Read such a failure as an environment artifact, not a regression, and re-run that file outside `virrun` (`pnpm vitest run --project <project> <path>`) to actually exercise it.

## Narrowing a run: `-t` and `-u`

- **`-t "name"` is not a scope — pass paths as well.** A name filter picks which tests _execute_; every test file in range is still collected, transformed and imported first, so `-t` alone spends a full suite's startup to run a handful of assertions. Whenever a run is narrowed by name — refreshing the bundle-size snapshots is the standing case, `-t "size" index.test.ts` (`references/platform-and-bundle-tests.md`) — narrow it by path in the same command.
- **`-u` can rewrite a snapshot belonging to a test it never ran.** `packages/vue-phaserjs/src/index.test.ts` splits its size snapshots by platform with `test.skipIf(process.platform === "win32")`, and a broad `-u` on Windows wrote the Windows byte counts into the **POSIX** slots — the two then read identically, which is the one thing that file exists to prevent, and it fails on CI's ubuntu runner rather than locally. So `-u` gets the narrowest path list that can produce the diff, and **`git diff` on the updated snapshots is read before committing**: a snapshot that moved in a file the change never touched is the tell.
