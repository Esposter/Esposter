import type { BenchmarkGroup } from "#src/models/BenchmarkGroup";
import type { BenchmarkReport } from "#src/models/BenchmarkReport";
import type { BenchmarkResult } from "#src/models/BenchmarkResult";
import type { BenchmarkTestCase } from "#src/models/BenchmarkTestCase";

import { InvalidOperationError, Operation } from "@esposter/shared";
// Projects one bench file's reported tests into the BenchmarkReport the formatter renders. A benchmark lives
// Inside a test now, so the group is the test — its full name is already "<describe> > <test>", which is the
// Heading the markdown carries. A test that ran more than one comparison names each one, since a single
// Heading for both would render two tables under the same title.
const getGroupName = (testCase: BenchmarkTestCase, benchmarkName: string, benchmarkCount: number): string =>
  benchmarkCount > 1 ? `${testCase.fullName} > ${benchmarkName}` : testCase.fullName;

export const buildBenchmarkFileReport = (filepath: string, testCases: Iterable<BenchmarkTestCase>): BenchmarkReport => {
  const groups: BenchmarkGroup[] = [];
  for (const testCase of testCases) {
    const testCaseBenchmarks = testCase.benchmarks();
    for (const { name, tasks } of testCaseBenchmarks) {
      const benchmarks: BenchmarkResult[] = [];
      // Fastest first, which is the order Vitest's own comparison table prints and the order `vs base` reads
      // Against — a rank rather than a registration position, so two runs of one group always diff line for line.
      for (const task of tasks.toSorted((first, second) => first.rank - second.rank)) {
        // A bench that threw on every iteration is recorded with zero samples — mean/p99 come back
        // Non-finite (undefined or NaN), which would later crash formatBenchmarkMarkdown on `mean.toFixed`
        // With a misleading "failed to write .md" error. Fail loud and named here instead, before any
        // Artifact is written, since Vitest's bench summary silently swallows the per-iteration throws.
        if (!Number.isFinite(task.latency.mean))
          throw new InvalidOperationError(
            Operation.Read,
            testCase.fullName,
            `benchmark "${task.name}" produced no samples — it likely threw on every iteration`,
          );
        benchmarks.push({
          mean: task.latency.mean,
          name: task.name,
          p99: task.latency.p99,
          rme: task.latency.rme,
          sampleCount: task.latency.samplesCount,
        });
      }
      if (benchmarks.length > 0)
        groups.push({ benchmarks, fullName: getGroupName(testCase, name, testCaseBenchmarks.length) });
    }
  }
  return { files: [{ filepath, groups }] };
};
