import type { ExecBackend } from "#src/models/exec/ExecBackend";

import { BackendType } from "#src/models/virrun/BackendType";
import { forwardTerminationSignals } from "#src/services/exec/util/forwardTerminationSignals";
import { spawnHidden } from "#src/services/exec/util/spawnHidden";
import { toExitCode } from "#src/services/exec/util/toExitCode";
// Runs the real command on the host, unchanged. It isolates nothing: it is the baseline every other backend is
// Measured against on speed and matched against on correctness, and the fallback a higher backend defers to
// When it cannot run a command.
export const createNativeBackend = (): ExecBackend => ({
  exec: (command, options) =>
    new Promise((resolve, reject) => {
      // A string runs through the shell (operator passthrough); an argv array runs the file directly
      // With shell: false so data-built commands can't be reinterpreted as shell metacharacters or
      // Git options. Both forms share the same capture + exit-code handling below.
      const isArgv = Array.isArray(command);
      const [file, ...args] = isArgv ? command : [command];
      const isWindowsArgv = isArgv && process.platform === "win32";
      const spawnFile = isWindowsArgv ? "cmd.exe" : file;
      const spawnArgs = isWindowsArgv ? ["/d", "/s", "/c", file, ...args] : args;
      const child = spawnHidden(spawnFile, spawnArgs, {
        cwd: options.cwd || undefined,
        // Inherit the host env, with options.env merged over it (the `VIRRUN` signal, and anything else the
        // Orchestrator passes) — the same contract the bwrap backend honors, so the native path and the
        // Sandbox expose an identical environment to the command.
        env: { ...process.env, ...options.env },
        shell: !isArgv,
        stdio: options.stdio,
      });
      forwardTerminationSignals(child);
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      child.on("error", reject);
      child.on("close", (code, signal) => {
        resolve({ exitCode: toExitCode(code, signal), stderr, stdout });
      });
    }),
  name: BackendType.Native,
});
