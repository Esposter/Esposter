import type { BenchmarkReport } from "@/models/BenchmarkReport";

import { formatBenchmarkMarkdown } from "@/services/formatBenchmarkMarkdown";
import { describe, expect, test } from "vitest";

describe(formatBenchmarkMarkdown, () => {
  const environment = "- Node: v0";
  const report: BenchmarkReport = {
    files: [
      {
        filepath: "",
        groups: [
          {
            benchmarks: [{ hz: 1, mean: 1, name: "", p99: 0, rme: 0, sampleCount: 0, sd: 0 }],
            fullName: " ",
          },
        ],
      },
    ],
  };

  test("renders the environment block and a section per group", () => {
    expect.hasAssertions();

    const markdown = formatBenchmarkMarkdown(report, environment);

    expect(markdown).toContain("# Benchmark results");
    expect(markdown).toContain(environment);
    expect(markdown).toContain("##  ");
    expect(markdown).toContain("|  | 1.00× | 1.0000 | ±0.00% | 0.0000 | 1 | 0 |");
  });

  test("derives the vs-base multiplier from the native baseline, faster above 1 and slower below", () => {
    expect.hasAssertions();

    const grouped: BenchmarkReport = {
      files: [
        {
          filepath: "",
          groups: [
            {
              benchmarks: [
                { hz: 1, mean: 2, name: "native", p99: 0, rme: 0, sampleCount: 0, sd: 0 },
                { hz: 2, mean: 1, name: " ", p99: 0, rme: 0, sampleCount: 0, sd: 0 },
                { hz: 0, mean: 4, name: "  ", p99: 0, rme: 0, sampleCount: 0, sd: 0 },
              ],
              fullName: " ",
            },
          ],
        },
      ],
    };
    const markdown = formatBenchmarkMarkdown(grouped, environment);

    expect(markdown).toContain("| native | 1.00× | 2.0000 | ±0.00% | 0.0000 | 1 | 0 |");
    expect(markdown).toContain("|   | 2.00× | 1.0000 | ±0.00% | 0.0000 | 2 | 0 |");
    expect(markdown).toContain("|    | 0.5× | 4.0000 | ±0.00% | 0.0000 | 0 | 0 |");
  });

  test("escapes pipe delimiters in benchmark names", () => {
    expect.hasAssertions();

    const escaped: BenchmarkReport = {
      files: [
        {
          filepath: "",
          groups: [
            { benchmarks: [{ hz: 1, mean: 1, name: " | ", p99: 1, rme: 0, sampleCount: 1, sd: 1 }], fullName: " " },
          ],
        },
      ],
    };
    const markdown = formatBenchmarkMarkdown(escaped, environment);

    expect(markdown).toContain(String.raw`|  \|  | 1.00× | 1.0000 | ±0.00% | 1.0000 | 1 | 1 |`);
  });
});
