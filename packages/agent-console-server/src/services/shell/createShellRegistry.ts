import type { ShellRegistry } from "#src/models/shell/ShellRegistry";
import type { ShellRegistryOptions } from "#src/models/shell/ShellRegistryOptions";
import type { ShellTerminal } from "#src/models/shell/ShellTerminal";

import { SHELL_OUTPUT_LENGTH } from "#src/services/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The host's shells, each under a pseudo-terminal in its session's working directory. A shell belongs to a session and
// Ends with it, and keeps its latest output so a page that reconnects is shown where it was
export const createShellRegistry = ({ onClose, onOutput, spawnShell }: ShellRegistryOptions): ShellRegistry => {
  const shellMap = new Map<string, { output: string; sessionId: string; terminal: ShellTerminal }>();
  const getTerminal = (shellId: string) => {
    const shell = shellMap.get(shellId);
    if (!shell) throw new InvalidOperationError(Operation.Read, shellId, "the shell is not running on this host");
    return shell.terminal;
  };

  return {
    close: (shellId) => {
      getTerminal(shellId).kill();
    },
    closeAll: () => {
      for (const { terminal } of shellMap.values()) terminal.kill();
    },
    closeSession: (sessionId) => {
      for (const shell of shellMap.values()) if (shell.sessionId === sessionId) shell.terminal.kill();
    },
    entries: () => Array.from(shellMap, ([shellId, { output, sessionId }]) => ({ output, sessionId, shellId })),
    open: async (sessionId, options) => {
      const shellId = crypto.randomUUID();
      const terminal = await spawnShell(options);
      const shell = { output: "", sessionId, terminal };
      shellMap.set(shellId, shell);
      terminal.onData((data) => {
        shell.output = `${shell.output}${data}`.slice(-SHELL_OUTPUT_LENGTH);
        onOutput(shellId, data);
      });
      terminal.onExit(() => {
        shellMap.delete(shellId);
        onClose(shellId);
      });
      return shellId;
    },
    resize: (shellId, cols, rows) => {
      getTerminal(shellId).resize(cols, rows);
    },
    write: (shellId, data) => {
      getTerminal(shellId).write(data);
    },
  };
};
