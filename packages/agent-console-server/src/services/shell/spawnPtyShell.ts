import type { ShellTerminal } from "#src/models/shell/ShellTerminal";
import type { ShellTerminalOptions } from "#src/models/shell/ShellTerminalOptions";

import { getShellFile } from "#src/services/shell/getShellFile";
import { loadNodePty } from "#src/services/shell/loadNodePty";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// The platform's shell under a pseudo-terminal, with the host's own environment, so it has what the session has. A host
// Without node-pty — an optional dependency with no prebuilt binary for every system — says so in words. The one thing
// Left out is PowerShell's module path: a host started from one PowerShell carries that one's modules, and the other
// Then fails to load them, PSReadLine first, so each PowerShell works out its own
export const spawnPtyShell = async ({ cols, cwd, rows }: ShellTerminalOptions): Promise<ShellTerminal> => {
  const { spawn } = await getResultAsync(() => loadNodePty()).match(
    (nodePty) => nodePty,
    () => {
      throw new InvalidOperationError(
        Operation.Create,
        cwd,
        "this host has no terminal support, so no shell can start",
      );
    },
  );
  // Windows names an environment variable in any case
  const env = Object.fromEntries(
    Object.entries<string | undefined>(process.env).filter(([key]) => key.toLowerCase() !== "psmodulepath"),
  );
  return spawn(getShellFile(), [], { cols, cwd, env, name: "xterm-256color", rows });
};
