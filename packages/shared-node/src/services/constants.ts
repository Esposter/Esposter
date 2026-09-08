import type { BenchCompareOptions } from "vitest";
// Zeroing both time budgets is what makes a committed sample count machine-stable: with no wall-clock budget
// To fill, tinybench falls back to pure iteration counts instead of running as many rounds as the budget
// Affords, which is a function of the host. The counts are named rather than left to tinybench's own defaults
// (64 measured, 16 warmup) because a bench here can be a whole build — eighty runs of one is tens of minutes,
// And ten is already enough for an honest `±rme`. Passed to `bench.compare()` or `bench().run()`; a bench with
// A heavier workload still spreads its own counts on top. The type comes from vitest's re-export of tinybench's
// Options, so nothing here depends on tinybench directly.
export const BENCHMARK_RUN_OPTIONS: BenchCompareOptions = {
  iterations: 10,
  time: 0,
  warmupIterations: 5,
  warmupTime: 0,
};
