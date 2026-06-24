import { getResult, normalizeString } from "@esposter/shared";
import { execSync } from "node:child_process";
import { arch, cpus, platform, release, totalmem } from "node:os";
import process from "node:process";

const GIBIBYTE = 1024 ** 3;
// The commit the numbers were produced on — provenance so a results file can be tied back to the code that
// Generated it (a bench can otherwise silently lag the implementation it benches). "unknown" outside a repo.
const readCommit = (): string => {
  const result = getResult(() => execSync("git rev-parse --short HEAD", { encoding: "utf8", stdio: "pipe" }));
  return result.isErr() ? "unknown" : normalizeString(result.value);
};
// The host + commit snapshot rendered into every colocated results.md — bench numbers are only comparable
// Across runs on the same machine, so the markdown carries its own environment block.
export const readBenchmarkEnvironment = (): string => {
  const cpu = cpus();
  return [
    `- Date: ${new Date().toISOString()}`,
    `- Commit: ${readCommit()}`,
    `- Node: ${process.version}`,
    `- OS: ${platform()} ${release()} (${arch()})`,
    `- CPU: ${cpu[0]?.model ?? "unknown"} × ${cpu.length}`,
    `- RAM: ${(totalmem() / GIBIBYTE).toFixed(1)} GiB`,
  ].join("\n");
};
