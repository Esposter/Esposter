import type { SerializedError, TestModule, TestRunEndReason } from "vitest/node";

import { writeBenchmarkResults } from "@/services/writeBenchmarkResults";
import { resolve } from "node:path";
import { BenchmarkReporter } from "vitest/node";

const JSON_EXTENSION_REGEX = /\.json$/u;
// Drop-in for Vitest's built-in benchmark reporter: super writes results.json (awaited) and prints the
// Comparison table, then we render the committed human-readable results.md beside it — so the markdown
// View is a side-effect of `vitest bench --run`, with no extra script or bin to chain. The markdown
// Path mirrors the configured outputJson (results.json → results.md). Default export: consumers wire it
// Via the `@esposter/shared-node/reporter` path string in `benchmark.reporters`, and Vitest's
// LoadCustomReporterModule requires a default export (it reads `module.default`).
export default class BenchmarkMarkdownReporter extends BenchmarkReporter {
  override async onTestRunEnd(
    testModules: readonly TestModule[],
    unhandledErrors: readonly SerializedError[],
    reason: TestRunEndReason,
  ): Promise<void> {
    await super.onTestRunEnd(testModules, unhandledErrors, reason);
    const outputJson = this.ctx.config.benchmark?.outputJson;
    if (outputJson === undefined) return;
    const jsonPath = resolve(this.ctx.config.root, outputJson);
    await writeBenchmarkResults(jsonPath, jsonPath.replace(JSON_EXTENSION_REGEX, ".md"));
  }
}
