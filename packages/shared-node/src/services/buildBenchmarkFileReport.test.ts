import type { BenchmarkTestCase, BenchmarkTestCaseTask } from "#src/models/BenchmarkTestCase";

import { buildBenchmarkFileReport } from "#src/services/buildBenchmarkFileReport";
import { describe, expect, test } from "vitest";

const createTask = (name: string, rank = 1, mean = 1): BenchmarkTestCaseTask => ({
  latency: { mean, p99: 1, rme: 0, samplesCount: 1 },
  name,
  rank,
});
const createTestCase = (fullName: string, benchmarks: BenchmarkTestCase["benchmarks"]): BenchmarkTestCase => ({
  benchmarks,
  fullName,
});

describe(buildBenchmarkFileReport, () => {
  const filepath = "src/foo.bench.ts";

  test("projects each benchmarking test into a group keyed by its full name, fastest task first", () => {
    expect.hasAssertions();

    const report = buildBenchmarkFileReport(filepath, [
      createTestCase("group > case", () => [{ name: "case", tasks: [createTask(" ", 2), createTask("native", 1)] }]),
    ]);

    expect(report).toStrictEqual({
      files: [
        {
          filepath,
          groups: [
            {
              benchmarks: [
                { mean: 1, name: "native", p99: 1, rme: 0, sampleCount: 1 },
                { mean: 1, name: " ", p99: 1, rme: 0, sampleCount: 1 },
              ],
              fullName: "group > case",
            },
          ],
        },
      ],
    });
  });

  test("names every group when one test ran more than one comparison", () => {
    expect.hasAssertions();

    const report = buildBenchmarkFileReport(filepath, [
      createTestCase("case", () => [
        { name: "first", tasks: [createTask("native")] },
        { name: "second", tasks: [createTask("native")] },
      ]),
    ]);

    expect(report.files[0]?.groups.map(({ fullName }) => fullName)).toStrictEqual(["case > first", "case > second"]);
  });

  test("omits tests that recorded no benchmarks", () => {
    expect.hasAssertions();

    const report = buildBenchmarkFileReport("empty.bench.ts", [createTestCase("no benches", () => [])]);

    expect(report).toStrictEqual({ files: [{ filepath: "empty.bench.ts", groups: [] }] });
  });

  test("throws a named error for a bench that produced no samples", () => {
    expect.hasAssertions();

    // A task that threw on every iteration is recorded with no finite stats.
    const testCases = [createTestCase("group", () => [{ name: "group", tasks: [createTask("os", 1, Number.NaN)] }])];

    expect(() => buildBenchmarkFileReport("broken.bench.ts", testCases)).toThrow(`benchmark "os" produced no samples`);
  });
});
