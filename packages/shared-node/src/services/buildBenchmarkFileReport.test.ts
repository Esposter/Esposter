import type { BenchmarkTestCase, BenchmarkTestCaseTask } from "#src/models/BenchmarkTestCase";

import { buildBenchmarkFileReport } from "#src/services/buildBenchmarkFileReport";
import { BASELINE_TASK_NAME } from "#src/services/constants";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
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
  const filepath = "";

  test("projects each benchmarking test into a group keyed by its full name, fastest task first", () => {
    expect.hasAssertions();

    const report = buildBenchmarkFileReport(filepath, [
      createTestCase("", () => [{ name: "", tasks: [createTask(" ", 2), createTask(BASELINE_TASK_NAME, 1)] }]),
    ]);

    expect(report).toStrictEqual({
      files: [
        {
          filepath,
          groups: [
            {
              benchmarks: [
                { mean: 1, name: BASELINE_TASK_NAME, p99: 1, rme: 0, sampleCount: 1 },
                { mean: 1, name: " ", p99: 1, rme: 0, sampleCount: 1 },
              ],
              fullName: "",
            },
          ],
        },
      ],
    });
  });

  test("names every group when one test ran more than one comparison", () => {
    expect.hasAssertions();

    const report = buildBenchmarkFileReport(filepath, [
      createTestCase("a", () => [
        { name: "b", tasks: [createTask("")] },
        { name: "c", tasks: [createTask("")] },
      ]),
    ]);

    expect(takeOne(report.files).groups.map(({ fullName }) => fullName)).toStrictEqual(["a > b", "a > c"]);
  });

  test("omits tests that recorded no benchmarks", () => {
    expect.hasAssertions();

    const report = buildBenchmarkFileReport(filepath, [createTestCase("", () => [])]);

    expect(report).toStrictEqual({ files: [{ filepath, groups: [] }] });
  });

  test("throws a named error for a bench that produced no samples", () => {
    expect.hasAssertions();

    // A task that threw on every iteration is recorded with no finite stats.
    const testCases = [createTestCase("", () => [{ name: "", tasks: [createTask("", 1, Number.NaN)] }])];

    expect(() => buildBenchmarkFileReport(filepath, testCases)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "", `benchmark "" produced no samples — it likely threw on every iteration`).message}]`,
    );
  });
});
