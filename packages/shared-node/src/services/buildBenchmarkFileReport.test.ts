import type { BenchmarkResult } from "@/models/BenchmarkResult";
import type { BenchmarkTaskNode } from "@/models/BenchmarkTaskNode";

import { buildBenchmarkFileReport } from "@/services/buildBenchmarkFileReport";
import { describe, expect, test } from "vitest";

describe(buildBenchmarkFileReport, () => {
  const benchmark: BenchmarkResult = { mean: 1, name: "native", p99: 1, rme: 0, sampleCount: 1 };
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
                { mean: 1, name: "native", p99: 1, rme: 0, sampleCount: 1 },
                { mean: 1, name: " ", p99: 1, rme: 0, sampleCount: 1 },
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

  test("throws a named error for a bench that produced no samples", () => {
    expect.hasAssertions();

    const file: BenchmarkTaskNode = {
      filepath: "/abs/broken.bench.ts",
      meta: {},
      name: "broken.bench.ts",
      tasks: [
        {
          meta: {},
          name: "group",
          suite: { meta: {}, name: "broken.bench.ts", type: "suite" },
          // A task that threw on every iteration: recorded with no finite stats (NaN mean here).
          tasks: [
            {
              meta: { benchmark: true },
              name: "os",
              result: { benchmark: { ...benchmark, mean: Number.NaN, name: "os" } },
              type: "test",
            },
          ],
          type: "suite",
        },
      ],
      type: "suite",
    };

    expect(() => buildBenchmarkFileReport(file)).toThrow(`benchmark "os" produced no samples`);
  });
});
