import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { StdioOptions } from "node:child_process";

import { parseBwrapExitCode } from "@/services/exec/parseBwrapExitCode";
import { parseBwrapStderrStatus } from "@/services/exec/parseBwrapStderrStatus";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";

interface BwrapCommand {
  readonly command: readonly [string, ...string[]];
  readonly statusSource: "fd" | "stderr";
}

export const createBwrapBackend = (
  createBwrapArgs: (
    command: readonly string[] | string,
    cwd: string,
    options: Pick<ExecOptions, "bindDirs" | "isNetworkEnabled">,
  ) => string[],
  createBwrapCommand: (bwrapArgs: readonly string[], options: ExecOptions) => BwrapCommand,
  errorName: string,
): ExecBackend => ({
  exec: (command, options) =>
    new Promise((resolve, reject) => {
      // Fd 3 is an extra pipe bwrap writes its JSON status to; stdin/out/err follow the requested
      // Stdio. Cwd lives inside the sandbox via --chdir, so it is not passed to spawn, and shell is
      // Always false — the overlay flags and command are an explicit argv that must never be
      // Reinterpreted by a host shell.
      const bwrapCommand = createBwrapCommand(createBwrapArgs(command, options.cwd, options), options);
      const [file, ...args] = bwrapCommand.command;
      const stdio: StdioOptions =
        bwrapCommand.statusSource === "fd"
          ? [options.stdio, options.stdio, options.stdio, "pipe"]
          : [options.stdio, options.stdio, "pipe"];
      const child = spawn(file, args, {
        env: { ...process.env, ...options.env },
        shell: false,
        stdio,
      });
      let stdout = "";
      let stderr = "";
      let status = "";
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      child.stdio[3]?.on("data", (chunk) => {
        status += chunk.toString();
      });
      child.on("error", reject);
      child.on("close", () => {
        const bwrapStderr =
          bwrapCommand.statusSource === "stderr" ? parseBwrapStderrStatus(stderr) : { status, stderr };
        const exitCode = parseBwrapExitCode(bwrapStderr.status);
        if (exitCode === undefined)
          reject(new InvalidOperationError(Operation.Create, errorName, "bubblewrap failed to set up the sandbox"));
        else resolve({ exitCode, stderr: bwrapStderr.stderr, stdout });
      });
    }),
  name: "os",
});
