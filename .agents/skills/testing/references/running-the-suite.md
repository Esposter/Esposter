# Running the Suite and Reading Its Failures

Read when narrowing a run by name or path, or when CI reports a failure a targeted run does not produce. **The full run itself belongs to CI** — running it locally is banned (see the skill's "Running Tests"), so this page is the flags a narrowed run takes and the failures CI reports back, not how to reproduce them by sweeping everything.

## What only the full parallel run catches

A green targeted run can hide **collateral damage from shared global state**. A sweep or mutation that is safe on an isolated, serial resource (a per-key cache dir) is catastrophic on a shared, concurrent one (the global `os.tmpdir()`, a shared registry): it deletes or corrupts a live sibling test's state. Treat any "another test's temp vanished" failure as your own regression, never flakiness.

This is the one risk of _this_ page's kind — collateral damage a green targeted run cannot show you — and it is bounded: it only applies to a change that writes to a process-global resource. It is not the only thing a targeted run misses; an unselected caller or integration path is missed too, and CI is what covers those. When a change does that, name the suites sharing that resource as extra path arguments rather than running everything — and otherwise let CI be the one to find it.

## A full-run timeout is not automatically a regression

Heavy seeded tests can blow the default timeout purely from full-suite parallel load. Rerun the file in isolation first: if it passes comfortably there and CI is green, leave it alone — **never** bump `testTimeout` or add a per-test `{ timeout }` to paper over machine load.

The inflation is not marginal, so a duration read off the full run says nothing about the test that produced it. A run spawns a worker per file and the repository has far more files than the machine has cores, so every heavy file — a PGlite-seeded suite, a snapshot over a parsed corpus, a compression suite — costs the better part of an order of magnitude more there than alone, and a test that takes a fraction of a second on its own can fail the default timeout. Nothing about such a test is slow; it is starved. The two settings that exist for this — the shared `hookTimeout` and the one per-test `{ timeout }` in `db-mock` — are the bound a PGlite boot needs while the rest of the suite competes for cores, and they are the exception the rule above names, not licence for a third.

## Settled — the runner settings, and the one that was measured and rejected

`fsModuleCache` stays on: transforming the module graph is the largest share of a run and it persists to `node_modules/.vitest-cache` across reruns and processes.

**`isolate: false` does not go on, per project or globally.** Vitest's own hint advertises it on every run and the whole-`packages` saving looks decisive. It is not: measured project by project, the packages that survive it come out level — the entire apparent gain belongs to `virrun` and `vue-phaserjs`, the two that **fail** under it, and fail for the reason isolation exists. virrun's suites read module-scope memo caches (`readWslPath`, the WSL environment and capability caches) that a reused worker carries between files, and `vue-phaserjs` boots one Phaser game per process. Buying the setting back would mean a reset hook per cache — custom scaffolding in exchange for nothing measurable. Re-propose it only with a per-project measurement showing a win.

## Environment

Tests run on Windows: `configuration/modules.ts` allowlists a minimal set of Nuxt modules under `process.env.VITEST`, so a test needing an excluded module adds it to that branch.

The host is Windows but the runner is not: `pnpm test` goes through `virrun`, whose win32 backend executes vitest inside WSL, so `process.platform` reads `linux` while `pnpm build` ran natively. Anything gated on `process.platform` is therefore selected by the sandbox rather than by the host — see `references/bundle-size.md` for the one suite this makes fail locally by design.

The sandbox carries no repository either: `.git` is not mounted into it, so a test that shells out to git (`git ls-files`, `git rev-parse`) fails locally with `fatal: not a git repository` while passing in CI, whose native backend runs against the real checkout. Read such a failure as an environment artifact, not a regression, and re-run that file outside `virrun` (`pnpm vitest run --project <project> <path>`) to actually exercise it.

## Narrowing a run: `-t` and `-u`

- **`-t "name"` is not a scope — pass paths as well.** A name filter picks which tests _execute_; every test file in range is still collected, transformed and imported first, so `-t` alone spends a full suite's startup to run a handful of assertions. Whenever a run is narrowed by name — refreshing the bundle-size snapshots is the standing case, `-t "size" index.test.ts` (`references/bundle-size.md`) — narrow it by path in the same command.
- **`-u` can rewrite a snapshot belonging to a test it never ran.** `packages/vue-phaserjs/src/index.test.ts` splits its size snapshots by platform with `test.skipIf(process.platform === "win32")`, and a broad `-u` on Windows wrote the Windows byte counts into the **POSIX** slots — the two then read identically, which is the one thing that file exists to prevent, and it fails on CI's ubuntu runner rather than locally. So `-u` gets the narrowest path list that can produce the diff, and **`git diff` on the updated snapshots is read before committing**: a snapshot that moved in a file the change never touched is the tell.

## Scoping a local run

- **Never run the full suite locally** — `pnpm test <paths> -u --run` with the paths the change touched. CI is the regression net and shards it across runners; a local run answers one question about one change. The scope is what the diff touched: the files changed, their direct consumers, and any suite whose snapshots the change moves — when unsure whether a distant suite is affected, name it in the same invocation rather than widening to everything, since a second path argument costs seconds and the full sweep costs the session. Full-run-only failures and the Windows module allowlist are `references/running-the-suite.md`.

## `-t` and `-u`

- **`-t "name"` is not a scope — pass paths as well**, and **`-u` gets the narrowest path list that can produce the diff**, with `git diff` on the updated snapshots read before committing. Why each flag misbehaves on its own: `references/running-the-suite.md`.
