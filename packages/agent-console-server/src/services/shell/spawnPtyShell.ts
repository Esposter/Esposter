import type { ShellTerminal } from "#src/models/shell/ShellTerminal";
import type { ShellTerminalOptions } from "#src/models/shell/ShellTerminalOptions";

import { getShellFile } from "#src/services/shell/getShellFile";
import { loadNodePty } from "#src/services/shell/loadNodePty";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// The platform's shell under a pseudo-terminal, with the host's own environment, so it has what the session has. A host
// Without node-pty — an optional dependency with no prebuilt binary for every system — says so in words
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
  return spawn(getShellFile(), [], { cols, cwd, env: process.env, name: "xterm-256color", rows });
};
