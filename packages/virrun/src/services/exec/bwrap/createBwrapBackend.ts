import type { BwrapCommand } from "@/models/exec/BwrapCommand";
import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { StdioOptions } from "node:child_process";

import { BackendType } from "@/models/virrun/BackendType";
import { createStderrLiveWriter } from "@/services/exec/bwrap/createStderrLiveWriter";
import { parseBwrapExitCode } from "@/services/exec/bwrap/parseBwrapExitCode";
import { parseBwrapStderrStatus } from "@/services/exec/bwrap/parseBwrapStderrStatus";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";

export const createBwrapBackend = (
  createBwrapArgs: (
    command: readonly string[] | string,
    cwd: string,
    options: Pick<ExecOptions, "bindDirs" | "isNetworkEnabled" | "overlayLayers">,
  ) => string[],
  createBwrapCommand: (bwrapArgs: readonly string[], options: ExecOptions) => BwrapCommand,
  errorName: string,
): ExecBackend => ({
  exec: (command, options) =>
    new Promise((resolve, reject) => {
      // Fd 3 is an extra pipe bwrap writes its JSON status to. shell:false — the overlay flags and command are an
      // Explicit argv a host shell must never reinterpret.
      const bwrapCommand = createBwrapCommand(createBwrapArgs(command, options.cwd, options), options);
      const [file, ...args] = bwrapCommand.command;
      const stdio: StdioOptions =
        bwrapCommand.statusSource === "fd"
          ? [options.stdio, options.stdio, options.stdio, "pipe"]
          : [options.stdio, options.stdio, "pipe"];
      const child = spawn(file, args, {
        env: bwrapCommand.env,
        shell: false,
        stdio,
      });
      let stdout = "";
      let stderr = "";
      let status = "";
      const isTee = options.tee === true && options.stdio === "pipe";
      // The wsl backend pipes stderr to parse its appended status block, so under "inherit" (or a wsl tee) stream the
      // Real output live, withholding the trailing status block; the fd backend's stderr is clean and tees raw.
      const writeStderrLive =
        (options.stdio === "inherit" || isTee) && bwrapCommand.statusSource === "stderr"
          ? createStderrLiveWriter()
          : undefined;
      child.stdout?.on("data", (chunk) => {
        const text = chunk.toString();
        stdout += text;
        if (isTee) process.stdout.write(text);
      });
      child.stderr?.on("data", (chunk) => {
        const text = chunk.toString();
        stderr += text;
        if (writeStderrLive) writeStderrLive(stderr);
        else if (isTee) process.stderr.write(text);
      });
      child.stdio[3]?.on("data", (chunk) => {
        status += chunk.toString();
      });
      child.on("error", reject);
      child.on("close", () => {
        const bwrapStderr =
          bwrapCommand.statusSource === "stderr" ? parseBwrapStderrStatus(stderr) : { status, stderr };
        const exitCode = parseBwrapExitCode(bwrapStderr.status);
        if (exitCode === undefined) {
          // Sandbox setup failed (bad flag, missing binary, WSL bridge or overlay-mount error); fold the captured
          // Stderr into the error so the user sees why.
          reject(
            new InvalidOperationError(
              Operation.Create,
              errorName,
              `bubblewrap failed to set up the sandbox${bwrapStderr.stderr ? `\n${bwrapStderr.stderr}` : ""}`,
            ),
          );
          return;
        }
        // Under "inherit" the output already reached the host live, so nothing is left to flush.
        if (options.stdio === "inherit") {
          resolve({ exitCode, stderr: "", stdout: "" });
          return;
        }
        resolve({ exitCode, stderr: bwrapStderr.stderr, stdout });
      });
    }),
  name: BackendType.Os,
});
