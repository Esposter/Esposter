import type { BenchmarkResult } from "@/models/BenchmarkResult";
import type { BenchmarkTaskNode } from "@/models/BenchmarkTaskNode";

import { buildBenchmarkFileReport } from "@/services/buildBenchmarkFileReport";
import { describe, expect, test } from "vitest";

describe(buildBenchmarkFileReport, () => {
  const benchmark: BenchmarkResult = { hz: 1, mean: 1, name: "native", p99: 1, rme: 0, sampleCount: 1, sd: 0 };
  const createBenchTask = (name: string): BenchmarkTaskNode => ({
    meta: { benchmark: true },
    name,
    result: { benchmark: { ...benchmark, name } },
    type: "test",
  });

  test("projects each describe with bench children into a group keyed by full name", () => {
    expect.hasAssertions();

    const fileName = "src/foo.bench.ts";
    const file: BenchmarkTaskNode = {
      filepath: `/abs/${fileName}`,
      meta: {},
      name: fileName,
      tasks: [
        {
          meta: {},
          name: "group",
          suite: { meta: {}, name: fileName, type: "suite" },
          tasks: [createBenchTask("native"), createBenchTask(" ")],
          type: "suite",
        },
      ],
      type: "suite",
    };
    const report = buildBenchmarkFileReport(file);

    expect(report).toStrictEqual({
      files: [
        {
          filepath: fileName,
          groups: [
            {
              benchmarks: [
                { hz: 1, mean: 1, name: "native", p99: 1, rme: 0, sampleCount: 1, sd: 0 },
                { hz: 1, mean: 1, name: " ", p99: 1, rme: 0, sampleCount: 1, sd: 0 },
              ],
              fullName: `${fileName} > group`,
            },
          ],
        },
      ],
    });
  });

  test("omits suites that declare no benchmarks", () => {
    expect.hasAssertions();

    const file: BenchmarkTaskNode = {
      filepath: "/abs/empty.bench.ts",
      meta: {},
      name: "empty.bench.ts",
      tasks: [{ meta: {}, name: "no benches", tasks: [], type: "suite" }],
      type: "suite",
    };
    const report = buildBenchmarkFileReport(file);

    expect(report).toStrictEqual({ files: [{ filepath: "empty.bench.ts", groups: [] }] });
  });
});
