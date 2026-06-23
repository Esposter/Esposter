import { benchmarkReportSchema } from "@/models/BenchmarkReport";
import { formatBenchmarkMarkdown } from "@/services/formatBenchmarkMarkdown";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { readFile, writeFile } from "node:fs/promises";
import { arch, cpus, platform, release, totalmem } from "node:os";
import { dirname, resolve } from "node:path";
import process from "node:process";

const GIBIBYTE = 1024 ** 3;
// Node:os snapshot of the host — bench numbers are only comparable across runs on the same machine.
const readEnvironment = (): string => {
  const cpu = cpus();
  return [
    `- Date: ${new Date().toISOString()}`,
    `- Node: ${process.version}`,
    `- OS: ${platform()} ${release()} (${arch()})`,
    `- CPU: ${cpu[0]?.model ?? "unknown"} × ${cpu.length}`,
    `- RAM: ${(totalmem() / GIBIBYTE).toFixed(1)} GiB`,
  ].join("\n");
};
// Renders the committed results.md from the results.json Vitest emits, and rewrites results.json with
// Relative filepaths (Vitest writes them absolute, leaking the home dir). The package-root prefix is
// Stripped off the raw JSON text — lossless, so Vitest's formatting and every field survive (the schema
// Is a lossy projection). safeParse so a malformed/format-drifted JSON fails loud, not silently.
export const writeBenchmarkResults = async (jsonPath: string, markdownPath: string): Promise<void> => {
  const packageRoot = `${resolve(dirname(jsonPath), "..").replaceAll("\\", "/")}/`;
  const result = await getResultAsync(async () => {
    const json = (await readFile(jsonPath, "utf8")).replaceAll(packageRoot, "");
    return { json, report: benchmarkReportSchema.safeParse(JSON.parse(json)) };
  });
  if (result.isErr()) throw new InvalidOperationError(Operation.Read, jsonPath, result.error.message);
  const { json, report } = result.value;
  if (!report.success) throw new InvalidOperationError(Operation.Read, jsonPath, report.error.message);
  const writeJsonResult = await getResultAsync(() => writeFile(jsonPath, json));
  if (writeJsonResult.isErr())
    throw new InvalidOperationError(Operation.Create, jsonPath, writeJsonResult.error.message);
  const markdown = formatBenchmarkMarkdown(report.data, readEnvironment());
  const writeResult = await getResultAsync(() => writeFile(markdownPath, markdown));
  if (writeResult.isErr()) throw new InvalidOperationError(Operation.Create, markdownPath, writeResult.error.message);
};
