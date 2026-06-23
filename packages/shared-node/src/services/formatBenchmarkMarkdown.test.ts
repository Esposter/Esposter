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
            benchmarks: [{ hz: 1, mean: 0, name: "", p99: 0, sampleCount: 0, sd: 0 }],
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
    expect(markdown).toContain("|  | 0.0000 | 0.0000 | 0.0000 | 1 | 0 |");
  });

  test("renders a row per benchmark across every file and group", () => {
    expect.hasAssertions();

    const multi: BenchmarkReport = {
      files: [
        ...report.files,
        {
          filepath: " ",
          groups: [{ benchmarks: [{ hz: 2, mean: 1, name: " ", p99: 1, sampleCount: 1, sd: 1 }], fullName: "  " }],
        },
      ],
    };
    const markdown = formatBenchmarkMarkdown(multi, environment);

    expect(markdown).toContain("|  | 0.0000 | 0.0000 | 0.0000 | 1 | 0 |");
    expect(markdown).toContain("|   | 1.0000 | 1.0000 | 1.0000 | 2 | 1 |");
  });

  test("escapes pipe delimiters in benchmark names", () => {
    expect.hasAssertions();

    const escaped: BenchmarkReport = {
      files: [
        {
          filepath: "",
          groups: [{ benchmarks: [{ hz: 1, mean: 1, name: " | ", p99: 1, sampleCount: 1, sd: 1 }], fullName: " " }],
        },
      ],
    };
    const markdown = formatBenchmarkMarkdown(escaped, environment);

    expect(markdown).toContain("|  \\|  | 1.0000 | 1.0000 | 1.0000 | 1 | 1 |");
  });
});
