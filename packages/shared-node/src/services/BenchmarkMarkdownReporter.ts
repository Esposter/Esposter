import type { Reporter, TestModule } from "vitest/node";

import { readBenchmarkEnvironment } from "#src/services/readBenchmarkEnvironment";
import { writeBenchmarkReport } from "#src/services/writeBenchmarkReport";
// Runs alongside Vitest's default reporter — a benchmark is an ordinary test result now, so the terminal
// Comparison table is the default reporter's and this one only adds the committed artifacts. Reached through
// The `@esposter/shared-node/reporter` path string in `getBenchmarkReporters`, which is why the class is the
// Default export: Vitest's custom-reporter loader reads `module.default`.
export default class BenchmarkMarkdownReporter implements Reporter {
  async onTestRunEnd(testModules: readonly TestModule[]): Promise<void> {
    const environment = readBenchmarkEnvironment();
    for (const testModule of testModules)
      await writeBenchmarkReport(
        testModule.moduleId,
        testModule.relativeModuleId,
        testModule.children.allTests(),
        environment,
      );
  }
}
