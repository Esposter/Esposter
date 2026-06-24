import type { ExecBackend } from "@/models/exec/ExecBackend";

import { buildBwrapArgs } from "@/services/exec/buildBwrapArgs";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { toExitCode } from "@/services/exec/toExitCode";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";
// The os backend: run every command — including native binaries — inside a bubblewrap RAM-overlay, so
// Reads fall through to the source while writes land in an invisible tmpfs upper, never touching the
// Host disk. This is what breaks the subprocess wall the vfs backend can't see past. It reuses the
// Exact spawn + capture + toExitCode plumbing as createNativeBackend; the only difference is the
// Command runs as `bwrap <overlay flags> -- <command>` (see buildBwrapArgs).
//
// Unlike createVfsBackend, this backend NEVER falls back to native. vfs falls back for correctness —
// A command it can't run in-process still produces the baseline result. Here isolation IS the result,
// So a silent native fallback would run the command un-isolated: a wrong answer disguised as success.
// An unsupported host (non-Linux, or no bubblewrap) therefore throws at construction instead.
export const createOsBackend = (): ExecBackend => {
  if (!isOsBackendSupported())
    throw new InvalidOperationError(Operation.Create, "os backend", "requires Linux + bubblewrap");
  return {
    exec: (command, options) =>
      new Promise((resolve, reject) => {
        // Cwd lives inside the sandbox via --chdir (see buildBwrapArgs), so it is not passed to spawn.
        // Shell: false always — the overlay flags and command are an explicit argv that must never be
        // Reinterpreted by a host shell. A string command is wrapped in /bin/sh INSIDE the sandbox.
        const child = spawn("bwrap", buildBwrapArgs(command, options.cwd), {
          shell: false,
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
    name: "os",
  };
};
