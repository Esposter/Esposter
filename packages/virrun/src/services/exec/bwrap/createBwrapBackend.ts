import type { CreateBwrapArgs } from "#src/models/exec/bwrap/CreateBwrapArgs";
import type { CreateBwrapCommand } from "#src/models/exec/bwrap/CreateBwrapCommand";
import type { ExecBackend } from "#src/models/exec/ExecBackend";
import type { StdioOptions } from "node:child_process";

import { BwrapStatusSource } from "#src/models/exec/bwrap/BwrapStatusSource";
import { BackendType } from "#src/models/virrun/BackendType";
import { createStderrLiveWriter } from "#src/services/exec/bwrap/createStderrLiveWriter";
import { getNoStatusFailureHeadline } from "#src/services/exec/bwrap/getNoStatusFailureHeadline";
import { parseBwrapExitCode } from "#src/services/exec/bwrap/parseBwrapExitCode";
import { parseBwrapStderrStatus } from "#src/services/exec/bwrap/parseBwrapStderrStatus";
import { forwardTerminationSignals } from "#src/services/exec/util/forwardTerminationSignals";
import { spawnHidden } from "#src/services/exec/util/spawnHidden";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const createBwrapBackend = (
  createBwrapArgs: CreateBwrapArgs,
  createBwrapCommand: CreateBwrapCommand,
  errorName: string,
): ExecBackend => ({
  exec: (command, options) =>
    new Promise((resolve, reject) => {
      // Fd 3 is an extra pipe bwrap writes its JSON status to. shell:false — the overlay flags and command are an
      // Explicit argv a host shell must never reinterpret.
      const bwrapCommand = createBwrapCommand(createBwrapArgs(command, options.cwd, options), options);
      const [file, ...args] = bwrapCommand.command;
      const stdio: StdioOptions =
        bwrapCommand.statusSource === BwrapStatusSource.Fd
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
        (options.stdio === "inherit" || teeTarget !== undefined) &&
        bwrapCommand.statusSource === BwrapStatusSource.Stderr
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
      child.on("close", (closeCode, closeSignal) => {
        const bwrapStderr =
          bwrapCommand.statusSource === BwrapStatusSource.Stderr ? parseBwrapStderrStatus(stderr) : { status, stderr };
        const exitCode = parseBwrapExitCode(bwrapStderr.status);
        if (exitCode === undefined) {
          // No status block means bwrap never reported, and only one of the reasons is bubblewrap: a folded prelude
          // Failed before the sandbox started (its marker line is in stderr), the run was killed from outside, or
          // Sandbox setup itself failed (bad flag, missing binary, WSL bridge or overlay-mount error).
          // GetNoStatusFailureHeadline names which; the captured stderr is folded in either way so the user sees why.
          const headline = getNoStatusFailureHeadline(
            bwrapStderr.stderr,
            closeCode ?? undefined,
            closeSignal ?? undefined,
          );
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
