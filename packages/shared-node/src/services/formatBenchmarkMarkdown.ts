import type { BenchmarkResult } from "@/models/BenchmarkResult";

import type { BenchmarkReport } from "@/models/BenchmarkReport";
// The baseline each group's `vs base` multiplier is measured against: the task named "native" when the
// Group has one (the host-baseline benches), otherwise the first declared task. Mirrors how bench files
// List the baseline first.
const getBaseline = (benchmarks: BenchmarkResult[]): BenchmarkResult | undefined =>
  benchmarks.find(({ name }) => name === "native") ?? benchmarks[0];
// baseline / row mean → a throughput multiplier: baseline reads 1.00×, faster tasks > 1, slower < 1.
// toPrecision keeps significant digits for sub-1 ratios so a 200×-slower task never collapses to 0.00×.
const formatRelative = (baselineMean: number, mean: number): string => {
  const ratio = baselineMean / mean;
  return `${ratio >= 1 ? ratio.toFixed(2) : Number(ratio.toPrecision(2))}×`;
};
// Renders Vitest's bench JSON into a committed, diffable table — the human-readable companion to the
// Raw results.json. Numbers are machine-dependent, so the environment block is rendered alongside;
// Only compare runs from the same environment. One section per describe() group, in file order. The
// `vs base` multiplier makes impact legible at a glance and makes a regression (a fast task drifting
// Back toward 1.00×) obvious on diff.
export const formatBenchmarkMarkdown = (report: BenchmarkReport, environment: string): string => {
  const sections = report.files.flatMap((file) =>
    file.groups.map((group) => {
      const baselineMean = getBaseline(group.benchmarks)?.mean ?? Number.NaN;
      const rows = group.benchmarks.map(
        ({ hz, mean, name, p99, rme, sampleCount }) =>
          `| ${name.replaceAll("|", String.raw`\|`)} | ${formatRelative(baselineMean, mean)} | ${mean.toFixed(4)} | ±${rme.toFixed(2)}% | ${p99.toFixed(4)} | ${hz.toFixed(0)} | ${sampleCount} |`,
      );
      return [
        `## ${group.fullName}`,
        "",
        "| task | vs base | mean (ms) | ±rme | p99 (ms) | ops/sec | samples |",
        "| ---- | ------- | --------- | ---- | -------- | ------- | ------- |",
        ...rows,
        "",
      ].join("\n");
    }),
  );
  return [
    "# Benchmark results",
    "",
    "Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff",
    "Over time to catch regressions. `vs base` is a throughput multiplier against each group's baseline",
    "(the `native` task, else the first): `1.00×` is the baseline, higher is faster, lower is slower — a",
    "fast task drifting back toward `1.00×` is a regression. `±rme` is the relative margin of error.",
    "Numbers are machine- and commit-dependent (see Environment); only compare runs from the same host.",
    "",
    "## Environment",
    "",
    environment,
    "",
    ...sections,
  ].join("\n");
};
