---
title: CI wall-time gate
description: Fail CI when a benchmarked path is slower than the native baseline by some threshold.
---

# CI wall-time gate

Run the speed benchmark in CI and fail the build when a path is slower than the native baseline by some threshold.

**Why not:** Wall-clock numbers on shared CI runners are noisy — neighbour load, throttling, and cold caches swing a ~140ms spawn by >20% (an early run flaked to 1.23× on pure measurement noise). A hard wall-clock gate would be flaky-red for the very reason it was first deferred: the signal-to-noise ratio doesn't support a pass/fail bar.

The need is already met elsewhere: speed regressions are caught by the committed colocated `*.bench.md` artifacts diffed offline ([benchmarking](/docs/virrun/benchmarking)), with the 🏎️ Bench CI job running plain `vitest bench` shards as an executes-clean smoke signal; correctness regressions hard-fail the CI coverage shards via the plain-Vitest differential suite ([correctness](/docs/virrun/correctness)). CodSpeed — hardware-independent CPU simulation with PR regression comments — previously covered the CI side but was removed after exceeding its 600 min/month free tier; the `CODSPEED_ENV`-gated plugin wiring stays for easy re-enable.
