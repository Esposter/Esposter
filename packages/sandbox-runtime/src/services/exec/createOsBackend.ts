import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { StdioOptions } from "node:child_process";

import { buildBwrapArgs } from "@/services/exec/buildBwrapArgs";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { parseBwrapExitCode } from "@/services/exec/parseBwrapExitCode";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";
// The os backend: run every command — including native binaries — inside a bubblewrap RAM-overlay, so
// Reads fall through to the source while writes land in an invisible tmpfs upper, never touching the
// Host disk. This is what breaks the subprocess wall the vfs backend can't see past. The command runs
// As `bwrap <overlay flags> -- <command>` (see buildBwrapArgs).
//
// Unlike createVfsBackend, this backend NEVER falls back to native. vfs falls back for correctness —
// A command it can't run in-process still produces the baseline result. Here isolation IS the result,
// So a silent native fallback would run the command un-isolated: a wrong answer disguised as success.
// An unsupported host (non-Linux, or no bubblewrap) therefore throws at construction instead.
//
// bwrap reports the sandboxed child's real exit code on a dedicated status fd (3). A child exit-code
// There means the command actually ran; its absence means the sandbox failed to set up (bad flag,
// Missing binary, overlay mount failure), so the backend rejects with a sandbox error instead of
// Passing bwrap's own diagnostics off as the command's result — which would also poison a diff against
// The native baseline (native stderr never contains `bwrap:` lines).
export const createOsBackend = (): ExecBackend => {
  if (!isOsBackendSupported())
    throw new InvalidOperationError(Operation.Create, createOsBackend.name, "requires Linux + bubblewrap");
  return {
    exec: (command, options) =>
      new Promise((resolve, reject) => {
        // Fd 3 is an extra pipe bwrap writes its JSON status to; stdin/out/err follow the requested
        // Stdio. Cwd lives inside the sandbox via --chdir (see buildBwrapArgs), so it is not passed to
        // Spawn, and shell is always false — the overlay flags and command are an explicit argv that
        // Must never be reinterpreted by a host shell.
        const stdio: StdioOptions = [options.stdio, options.stdio, options.stdio, "pipe"];
        const child = spawn("bwrap", ["--json-status-fd", "3", ...buildBwrapArgs(command, options.cwd, options)], {
          shell: false,
          stdio,
        });
        let stdout = "";
        let stderr = "";
        let status = "";
        child.stdout?.on("data", (chunk: Buffer) => {
          stdout += chunk.toString();
        });
        child.stderr?.on("data", (chunk: Buffer) => {
          stderr += chunk.toString();
        });
        child.stdio[3]?.on("data", (chunk: Buffer) => {
          status += chunk.toString();
        });
        child.on("error", reject);
        child.on("close", () => {
          const exitCode = parseBwrapExitCode(status);
          if (exitCode === undefined)
            reject(
              new InvalidOperationError(
                Operation.Create,
                createOsBackend.name,
                "bubblewrap failed to set up the sandbox",
              ),
            );
          else resolve({ exitCode, stderr, stdout });
        });
      }),
    name: "os",
  };
};
