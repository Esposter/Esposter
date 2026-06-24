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
    const environment = readBenchmarkEnvironment();
    for (const file of this.ctx.state.getFiles()) await writeBenchmarkReport(file, environment);
  }
}
