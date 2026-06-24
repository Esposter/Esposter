import type { SerializedError, TestModule, TestRunEndReason } from "vitest/node";

import { readBenchmarkEnvironment } from "@/services/readBenchmarkEnvironment";
import { writeBenchmarkReport } from "@/services/writeBenchmarkReport";
import { BenchmarkReporter } from "vitest/node";

// Drop-in for Vitest's built-in benchmark reporter: super still prints the comparison table, then instead
// Of one merged results.json per package we emit a colocated results pair beside every bench file
// (Foo.bench.ts → Foo.bench.json + Foo.bench.md) — each bench scoped to its own file, like its test. The
// Run task trees come from `ctx.state.getFiles()` (no `benchmark.outputJson` needed). Default export:
// Consumers wire it via the `@esposter/shared-node/reporter` path string in `benchmark.reporters`, and
// Vitest's loadCustomReporterModule requires a default export (it reads `module.default`).
export default class BenchmarkMarkdownReporter extends BenchmarkReporter {
  override async onTestRunEnd(
    testModules: readonly TestModule[],
    unhandledErrors: readonly SerializedError[],
    reason: TestRunEndReason,
  ): Promise<void> {
    await super.onTestRunEnd(testModules, unhandledErrors, reason);
    // Under the CodSpeed runner (CI, CODSPEED_ENV set) results go to the hosted dashboard, and the
    // Instruments run each bench once rather than sampling — so the in-memory tinybench stats aren't the
    // Walltime numbers the committed .md tracks. Skip writing the colocated artifacts in that case; locally
    // (`pnpm bench`, no CodSpeed) this still emits Foo.bench.json + Foo.bench.md beside each source.
    if (process.env.CODSPEED_ENV !== undefined) return;
    const environment = readBenchmarkEnvironment();
    for (const file of this.ctx.state.getFiles()) await writeBenchmarkReport(file, environment);
  }
}
