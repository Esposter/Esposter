import type { BenchmarkProvider, BenchResult } from "vitest";

import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { Bench } from "tinybench";

// The run a smoke check needs: one measured iteration and no warmup, with no time budget to fill. These are spread last,
// Over whatever a bench file passed, so a heavier group's own counts cannot bring the minutes back
const SMOKE_RUN_OPTIONS = { iterations: 1, time: 0, warmup: false, warmupIterations: 0, warmupTime: 0 };

// Vitest's benchmark provider for a run whose numbers nobody reads, which is every CI run: each registered bench executes
// Once, so the run still proves every bench file loads, builds its fixtures and runs its tasks without throwing, at a
// Fraction of a measured run's cost. Otherwise it does what Vitest's own tinybench provider does, which Vitest does not
// Export. `getBenchmarkTestConfiguration` selects it when `BENCHMARK_SMOKE_RUN` is set
const benchmarkSmokeProvider: BenchmarkProvider = {
  run: async ({ config, options, registrations, test }) => {
    const bench = new Bench({
      name: test.fullTestName,
      retainSamples: config.retainSamples,
      signal: test.context.signal,
      ...options,
      ...SMOKE_RUN_OPTIONS,
    });
    for (const { fn, fnOpts, name } of registrations) bench.add(name, fn, fnOpts);
    await bench.run();

    const results: BenchResult[] = [];
    const errors: Error[] = [];
    for (const { name, result } of bench.tasks)
      if (result.state === "completed") results.push({ ...result, name });
      else if (result.state === "errored") errors.push(result.error);
      else
        errors.push(
          new InvalidOperationError(Operation.Read, name, `the bench did not complete: its state is "${result.state}"`),
        );

    if (errors.length === 1) throw takeOne(errors);
    else if (errors.length > 1) throw new AggregateError(errors, "Some benchmarks failed");
    return results;
  },
};

export default benchmarkSmokeProvider;
