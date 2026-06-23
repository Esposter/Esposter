import { createSandbox } from "@/services/sandbox/createSandbox";
import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";
import process from "node:process";
// Minimal speed-gate harness (specs/benchmarking.md). The rule: a sandbox path that loses to the
// Native baseline has negative value. With the native passthrough backend the two are expected to
// Tie — this exists to prove the measurement works, not to show a win yet. Real backends report a
// Matrix of cache states here; for now it is one command, median of a few runs, native vs sandbox.
const RUNS = 5;
const COMMAND = `node -e "process.stdout.write('bench')"`;
const runNative = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(COMMAND, { shell: true, stdio: "ignore" });
    child.on("error", reject);
    child.on("close", () => {
      resolve();
    });
  });
const median = async (run: () => Promise<unknown>): Promise<number> => {
  const samples: number[] = [];
  for (let i = 0; i < RUNS; i++) {
    const start = performance.now();
    await run();
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)] ?? 0;
};
const sandbox = await createSandbox();
const sandboxMedian = await median(() => sandbox.exec(COMMAND));
const nativeMedian = await median(runNative);
await sandbox.dispose();
const ratio = sandboxMedian / nativeMedian;
process.stdout.write(`native  median: ${nativeMedian.toFixed(1)}ms\n`);
process.stdout.write(`sandbox median: ${sandboxMedian.toFixed(1)}ms\n`);
process.stdout.write(`ratio (sandbox/native): ${ratio.toFixed(2)}x  ${ratio <= 1.1 ? "OK" : "REGRESSION"}\n`);
