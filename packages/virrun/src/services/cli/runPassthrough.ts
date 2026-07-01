import type { ExecutionMode } from "@/models/virrun/ExecutionMode";
import type { ArgsDef, CommandDef } from "citty";

import { runVirrunCommand } from "@/services/cli/runVirrunCommand";
import { showUsage } from "citty";
// Shared body of the three passthrough commands. An empty command argv is a usage error — print citty's generated
// Help and exit non-zero rather than hand an empty command to the backend. Generic over the caller's arg shape so a
// Specific-args command (run's `--ephemeral`) is accepted without a cast.
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
