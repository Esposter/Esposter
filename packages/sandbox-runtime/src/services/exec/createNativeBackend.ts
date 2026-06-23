import type { ExecBackend } from "@/models/exec/ExecBackend";

import { toExitCode } from "@/services/exec/toExitCode";
import { spawn } from "node:child_process";
// The only backend today: run the real command on the host, unchanged. It does not isolate or
// Virtualize anything — it is the baseline the future `vfs`/`os` backends must beat on speed and
// Match on correctness, and the fallback every higher backend defers to when it can't run a command.
export const createNativeBackend = (): ExecBackend => ({
  exec: (command, options) =>
    new Promise((resolve, reject) => {
      // A string runs through the shell (operator passthrough); an argv array runs the file directly
      // With shell: false so data-built commands can't be reinterpreted as shell metacharacters or
      // Git options. Both forms share the same capture + exit-code handling below.
      const [file, ...args] = Array.isArray(command) ? command : [command];
      const child = spawn(file, args, {
        cwd: options.cwd === "" ? undefined : options.cwd,
        shell: !Array.isArray(command),
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
      child.on("close", (code, signal) => {
        resolve({ exitCode: toExitCode(code, signal), stderr, stdout });
      });
    }),
  name: "native",
});
