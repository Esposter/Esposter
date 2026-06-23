import { benchmarkReportSchema } from "@/models/BenchmarkReport";
import { formatBenchmarkMarkdown } from "@/services/formatBenchmarkMarkdown";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { readFile, writeFile } from "node:fs/promises";
import { arch, cpus, platform, release, totalmem } from "node:os";
import process from "node:process";

const GIBIBYTE = 1024 ** 3;
// node:os snapshot of the host — bench numbers are only comparable across runs on the same machine.
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
// Converts the machine-readable results.json Vitest emits into the committed human-readable
// results.md. safeParse over a bare cast so a malformed/format-drifted JSON fails loud, not silently.
export const writeBenchmarkResults = async (jsonPath: string, markdownPath: string): Promise<void> => {
  const result = await getResultAsync(async () =>
    benchmarkReportSchema.safeParse(JSON.parse(await readFile(jsonPath, "utf8"))),
  );
  if (result.isErr()) throw new InvalidOperationError(Operation.Read, jsonPath, result.error.message);
  if (!result.value.success) throw new InvalidOperationError(Operation.Read, jsonPath, result.value.error.message);
  const markdown = formatBenchmarkMarkdown(result.value.data, readEnvironment());
  const writeResult = await getResultAsync(() => writeFile(markdownPath, markdown));
  if (writeResult.isErr()) throw new InvalidOperationError(Operation.Create, markdownPath, writeResult.error.message);
};
