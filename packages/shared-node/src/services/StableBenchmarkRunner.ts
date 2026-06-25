import { createStableBench } from "@/services/createStableBench";
import { BenchmarkRunner } from "vitest";
// Vitest builds each bench as `new Bench(getBenchOptions(benchmark))`, and `getBenchOptions` (module-private)
// Returns only the per-bench `options` arg — it injects no config-level defaults. The one overridable seam is
// `importTinybench()`, which supplies the `Bench` constructor; we swap in `createStableBench`'s subclass so
// Benches run a fixed iteration count (machine-independent sample counts) instead of a wall-clock budget.
// Wired via the `@esposter/shared-node/runner` path string in `getBenchmarkRunner`, applied only in bench mode
// (it extends the bench runner, which throws in test mode).
export default class StableBenchmarkRunner extends BenchmarkRunner {
  override async importTinybench(): ReturnType<BenchmarkRunner["importTinybench"]> {
    const tinybench = await super.importTinybench();
    return { ...tinybench, Bench: createStableBench(tinybench.Bench) };
  }
}
