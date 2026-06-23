import type { ExecBackend } from "@/models/exec/ExecBackend";
import { spawn } from "node:child_process";
// The only backend today: run the real command on the host, unchanged. It does not isolate or
// virtualize anything — it is the baseline the future `vfs`/`os` backends must beat on speed and
// match on correctness, and the fallback every higher backend defers to when it can't run a command.
export const createNativeBackend = (): ExecBackend => ({
  exec: (command, options) =>
    new Promise((resolve, reject) => {
      const child = spawn(command, {
        cwd: options.cwd === "" ? undefined : options.cwd,
        shell: true,
        stdio: options.stdio,
      });
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on("error", reject);
      child.on("close", (code) => {
        resolve({ exitCode: code ?? 0, stderr, stdout });
      });
    }),
  name: "native",
});
