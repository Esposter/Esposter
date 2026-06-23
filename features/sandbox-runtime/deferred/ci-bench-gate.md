# Enforce the bench + differential suites as required CI gates

Run the speed benchmark and the differential-correctness suite in CI and fail the build on a regression (slower than baseline) or a divergence from native.

## Why deferred

The only backend today is the native passthrough, so every comparison is native-vs-native: the bench always ties ~1.0x (an early run flaked to 1.23x on a ~140ms spawn — pure measurement noise) and the differential suite is always identical by construction. A required gate now would be flaky-red for zero signal — nothing _can_ regress until a backend actually does work differently from native.

## Revisit when

The first real backend lands — `vfs` (Phase 1) — so a regression or divergence becomes meaningful. At that point wire `pnpm bench` + the differential run into CI on the core packages and flip the bench harness's verdict to a non-zero exit (it currently reports `REGRESSION` but never fails the process).

## Cheaper interim

`pnpm bench` writes a committed `packages/sandbox-runtime/bench/results.md` (environment metadata + latency stats). Regenerate it before committing and diff the ratio — a manual, zero-infra version of the regression gate that already tracks perf over time.
