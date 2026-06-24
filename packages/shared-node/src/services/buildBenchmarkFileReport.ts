import type { BenchmarkGroup } from "@/models/BenchmarkGroup";
import type { BenchmarkReport } from "@/models/BenchmarkReport";
import type { BenchmarkResult } from "@/models/BenchmarkResult";
import type { BenchmarkTaskNode } from "@/models/BenchmarkTaskNode";

import { InvalidOperationError, Operation } from "@esposter/shared";

const SUITE_TYPE = "suite";
// Depth-first, file then nested describes — mirrors Vitest's own getTasks order so md sections stay in
// Declaration order. A non-suite (a bench task itself) contributes nothing here; its stats are read from
// Its parent suite below.
const collectSuites = (node: BenchmarkTaskNode, accumulator: BenchmarkTaskNode[] = []): BenchmarkTaskNode[] => {
  if (node.type !== SUITE_TYPE) return accumulator;
  accumulator.push(node);
  for (const child of node.tasks ?? []) collectSuites(child, accumulator);
  return accumulator;
};
// Root-first join of every ancestor name — the file node's name is its package-relative path — matching
// Vitest's getFullName so a group title reads "<file> > <describe>".
const getFullName = (node: BenchmarkTaskNode): string => {
  const names: string[] = [];
  let current: BenchmarkTaskNode | undefined = node;
  while (current) {
    if (current.name) names.unshift(current.name);
    current = current.suite;
  }
  return names.join(" > ");
};
// Projects one bench file's runner task tree into the BenchmarkReport our formatter renders: each suite
// With bench children becomes a group, keyed by full name, carrying only the fields the schema declares.
export const buildBenchmarkFileReport = (file: BenchmarkTaskNode): BenchmarkReport => {
  const groups: BenchmarkGroup[] = [];
  for (const suite of collectSuites(file)) {
    const benchmarks: BenchmarkResult[] = [];
    for (const task of suite.tasks ?? []) {
      const benchmark = task.result?.benchmark;
      if (!task.meta.benchmark || !benchmark) continue;
      // A bench that threw on every iteration is recorded with zero samples — mean/hz/p99 come back
      // Non-finite (undefined or NaN), which would later crash formatBenchmarkMarkdown on `mean.toFixed`
      // With a misleading "failed to write .md" error. Fail loud and named here instead, before any
      // Artifact is written, since Vitest's bench summary silently swallows the per-iteration throws.
      if (!Number.isFinite(benchmark.mean))
        throw new InvalidOperationError(
          Operation.Read,
          getFullName(suite),
          `benchmark "${benchmark.name}" produced no samples — it likely threw on every iteration`,
        );
      benchmarks.push({
        hz: benchmark.hz,
        mean: benchmark.mean,
        name: benchmark.name,
        p99: benchmark.p99,
        rme: benchmark.rme,
        sampleCount: benchmark.sampleCount,
        sd: benchmark.sd,
      });
    }
    if (benchmarks.length > 0) groups.push({ benchmarks, fullName: getFullName(suite) });
  }
  return { files: [{ filepath: file.name, groups }] };
};
