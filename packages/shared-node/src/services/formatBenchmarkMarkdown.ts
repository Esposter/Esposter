import type { BenchmarkReport } from "@/models/BenchmarkReport";
// Renders Vitest's bench JSON into a committed, diffable table — the human-readable companion to the
// Raw results.json. Numbers are machine-dependent, so the environment block is rendered alongside;
// Only compare runs from the same environment. One section per describe() group, in file order.
export const formatBenchmarkMarkdown = (report: BenchmarkReport, environment: string): string => {
  const sections = report.files.flatMap((file) =>
    file.groups.map((group) => {
      const rows = group.benchmarks.map(
        ({ hz, mean, name, p99, sampleCount, sd }) =>
          `| ${name.replaceAll("|", String.raw`\|`)} | ${mean.toFixed(4)} | ${sd.toFixed(4)} | ${p99.toFixed(4)} | ${hz.toFixed(0)} | ${sampleCount} |`,
      );
      return [
        `## ${group.fullName}`,
        "",
        "| task | mean (ms) | sd | p99 (ms) | ops/sec | samples |",
        "| ---- | --------- | -- | -------- | ------- | ------- |",
        ...rows,
        "",
      ].join("\n");
    }),
  );
  return [
    "# Benchmark results",
    "",
    "Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff",
    "Over time to catch regressions.",
    "",
    "## Environment",
    "",
    environment,
    "",
    ...sections,
  ].join("\n");
};
