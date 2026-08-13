import type { BwrapCommand } from "@/models/exec/bwrap/BwrapCommand";
import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { StdioOptions } from "node:child_process";

import { BackendType } from "@/models/virrun/BackendType";
import { WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER } from "@/services/exec/bwrap/constants";
import { createStderrLiveWriter } from "@/services/exec/bwrap/createStderrLiveWriter";
import { parseBwrapExitCode } from "@/services/exec/bwrap/parseBwrapExitCode";
import { parseBwrapStderrStatus } from "@/services/exec/bwrap/parseBwrapStderrStatus";
import { forwardTerminationSignals } from "@/services/exec/util/forwardTerminationSignals";
import { spawnHidden } from "@/services/exec/util/spawnHidden";
import { InvalidOperationError, Operation } from "@esposter/shared";

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
      const child = spawnHidden(file, args, {
        env: bwrapCommand.env,
        shell: false,
        stdio,
      });
      forwardTerminationSignals(child, bwrapCommand.onTerminate);
      let stdout = "";
      let stderr = "";
      let status = "";
      const teeTarget = options.stdio === "pipe" ? options.tee : undefined;
      // The wsl backend pipes stderr to parse its appended status block, so under "inherit" (or a wsl tee) stream the
      // Real output live, withholding the trailing status block; the fd backend's stderr is clean and tees raw.
      const writeStderrLive =
        (options.stdio === "inherit" || teeTarget !== undefined) && bwrapCommand.statusSource === "stderr"
          ? createStderrLiveWriter()
          : undefined;
      child.stdout?.on("data", (chunk) => {
        const text = chunk.toString();
        stdout += text;
        if (teeTarget) process[teeTarget].write(text);
      });
      child.stderr?.on("data", (chunk) => {
        const text = chunk.toString();
        stderr += text;
        if (writeStderrLive) writeStderrLive(stderr);
        else if (teeTarget) process.stderr.write(text);
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
          // No status block means bwrap never reported: either the wsl backend's folded sync prelude failed before
          // The sandbox started (its marker line is in stderr — name that failure, not bubblewrap) or sandbox setup
          // Itself failed (bad flag, missing binary, WSL bridge or overlay-mount error). Fold the captured stderr
          // Into the error either way so the user sees why.
          const headline = bwrapStderr.stderr.includes(WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER)
            ? "the source mirror sync failed before the sandbox started"
            : "bubblewrap failed to set up the sandbox";
          reject(
            new InvalidOperationError(
              Operation.Create,
              errorName,
              `${headline}${bwrapStderr.stderr ? `\n${bwrapStderr.stderr}` : ""}`,
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
