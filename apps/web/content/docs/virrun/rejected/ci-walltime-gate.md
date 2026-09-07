---
title: CI wall-time gate
description: Fail CI when a benchmarked path is slower than the native baseline by some threshold.
---

# CI wall-time gate

Run the speed benchmark in CI and fail the build when a path is slower than the native baseline by some threshold.

**Why not:** Wall-clock numbers on shared CI runners are noisy — neighbour load, throttling and cold caches swing a sub-second spawn by more than the regression threshold would be, so a run can cross the bar on measurement noise alone. The signal-to-noise ratio does not support a pass/fail gate.

The need is already met elsewhere: speed regressions are caught by the committed colocated `*.bench.md` artifacts diffed offline ([benchmarking](/docs/virrun/benchmarking)), with the 🏎️ Bench CI job running plain `vitest bench` as an executes-clean smoke signal; correctness regressions hard-fail the CI coverage shards via the plain-Vitest differential suite ([correctness](/docs/virrun/correctness)).
