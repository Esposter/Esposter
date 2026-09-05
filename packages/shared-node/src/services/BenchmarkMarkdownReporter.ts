import type { SerializedError, TestModule, TestRunEndReason } from "vitest/node";

import { readBenchmarkEnvironment } from "#src/services/readBenchmarkEnvironment";
import { writeBenchmarkReport } from "#src/services/writeBenchmarkReport";
import { BenchmarkReporter } from "vitest/node";
// Drop-in for Vitest's built-in benchmark reporter: super still prints the comparison table, then the
// Run task trees are read straight off `ctx.state.getFiles()`, so no `benchmark.outputJson` is needed.
// The default export is what Vitest's loadCustomReporterModule requires (it reads `module.default`),
// Reached through the `@esposter/shared-node/reporter` path string in `benchmark.reporters`.
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
