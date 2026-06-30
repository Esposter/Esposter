import type { ArgsDef, CommandDef } from "citty";
import type { ExecutionMode } from "@/models/virrun/ExecutionMode";

import { runVirrunCommand } from "@/services/cli/runVirrunCommand";
import { showUsage } from "citty";
import process from "node:process";
// Shared body of the three passthrough commands — the default `virrun -- <cmd>`, `virrun run`, and `virrun exec`.
// The command argv is citty's positional rest (`args._`, everything after `--`); an empty one is a usage error, so
// Print citty's generated help and exit non-zero instead of handing an empty command to the backend. Otherwise
// Delegate to runVirrunCommand and propagate its exit code. `mode` forwards the execution path (persist/fork/exec).
// Generic over the caller's arg shape so a specific-args command (run's `--ephemeral`) is accepted without a cast.
export const runPassthrough = async <T extends ArgsDef>(
  command: readonly string[],
  cmd: CommandDef<T>,
  mode: ExecutionMode,
): Promise<void> => {
  if (command.length === 0) {
    await showUsage(cmd);
    process.exitCode = 1;
    return;
  }
  process.exitCode = await runVirrunCommand(command, { mode });
};
