import type { BenchmarkRunner } from "vitest";
// The tinybench `Bench` constructor type, sourced the same way the runner gets the value — through vitest's
// `importTinybench()` return — so shared-node needs no direct `tinybench` dependency (there is none by design).
type Bench = Awaited<ReturnType<BenchmarkRunner["importTinybench"]>>["Bench"];
// Returns a `Bench` subclass whose constructor floors every bench's options with a zeroed time budget:
// `{ time: 0, warmupTime: 0 }` first, the caller's `options` spread ON TOP (so a bench that sets its own
// `time`/`iterations` still wins). With the time budgets zeroed, tinybench's run/warmup loops fall back to pure
// Iteration counts (its defaults: 10 measured, 5 warmup) instead of a wall-clock budget, so the sample count is
// Machine-independent and the committed `*.bench.md` stays stable across hosts. The subclass must close over
// The runtime-imported `Bench`, so it cannot be a top-level class in `StableBenchmarkRunner`.
export const createStableBench = (Bench: Bench): Bench =>
  class extends Bench {
    constructor(options: ConstructorParameters<Bench>[0] = {}) {
      super({ time: 0, warmupTime: 0, ...options });
    }
  };
