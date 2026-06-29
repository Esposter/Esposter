import type { BenchmarkTaskNode } from "@/models/BenchmarkTaskNode";

import { buildBenchmarkFileReport } from "@/services/buildBenchmarkFileReport";
import { formatBenchmarkMarkdown } from "@/services/formatBenchmarkMarkdown";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { writeFile } from "node:fs/promises";

const TS_EXTENSION_REGEX = /\.ts$/u;
// Writes a bench file's results as two artifacts colocated beside the source (Foo.bench.ts →
// Foo.bench.json + Foo.bench.md), so each bench is scoped to its file the way its test is, rather than one
// Merged report per package. No-op for a bench file Vitest ran that declared no benchmarks (e.g. a shared
// Bench helper). The json filepath is package-relative (file.name), so no absolute home dir leaks.
export const writeBenchmarkReport = async (file: BenchmarkTaskNode, environment: string): Promise<void> => {
  if (file.filepath === undefined) return;
  const report = buildBenchmarkFileReport(file);
  const [benchmarkFile] = report.files;
  if (benchmarkFile === undefined || benchmarkFile.groups.length === 0) return;
  const basePath = file.filepath.replace(TS_EXTENSION_REGEX, "");
  // A `*.platform.bench.ts` source opts its results into per-platform artifacts: its numbers differ by host
  // (e.g. the os backend runs as `os/linux` natively and `os/wsl` bridged from win32), so a single committed
  // File would clobber the other platform every run. Suffix such a file's artifacts with `process.platform`
  // (Foo.platform.bench.win32.{json,md} / Foo.platform.bench.linux.{json,md}) so each platform's run updates
  // Only its own file. Plain `*.bench.ts` files stay single-artifact and cross-platform.
  const reportPath = basePath.endsWith(".platform.bench") ? `${basePath}.${process.platform}` : basePath;
  const jsonPath = `${reportPath}.json`;
  const jsonResult = await getResultAsync(() => writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`));
  if (jsonResult.isErr()) throw new InvalidOperationError(Operation.Create, jsonPath, jsonResult.error.message);
  const markdownPath = `${reportPath}.md`;
  const markdownResult = await getResultAsync(() =>
    writeFile(markdownPath, formatBenchmarkMarkdown(report, environment)),
  );
  if (markdownResult.isErr())
    throw new InvalidOperationError(Operation.Create, markdownPath, markdownResult.error.message);
};
