import type { ShellRegistry } from "#src/models/shell/ShellRegistry";
import type { ShellRegistryOptions } from "#src/models/shell/ShellRegistryOptions";
import type { ShellTerminal } from "#src/models/shell/ShellTerminal";

import { SHELL_OUTPUT_LENGTH } from "#src/services/constants";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";

// The host's shells, each under a pseudo-terminal in its session's working directory. A shell belongs to a session and
// Ends with it, and keeps its latest output so a page that reconnects is shown where it was. A shell still starting
// When its session or the host closes is ended as it arrives, since the close found nothing of it to end, and a closed
// Session starts no shell until it opens again
export const createShellRegistry = ({ onClose, onOutput, spawnShell }: ShellRegistryOptions): ShellRegistry => {
  const shellMap = new Map<string, { output: string; sessionId: string; terminal: ShellTerminal }>();
  const pendingShells = new Set<{ isClosed: boolean; sessionId: string }>();
  const closedSessionIds = new Set<string>();
  let isStopped = false;
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
      isStopped = true;
      for (const pendingShell of pendingShells) pendingShell.isClosed = true;
      for (const { terminal } of shellMap.values()) terminal.kill();
    },
    closeSession: (sessionId) => {
      closedSessionIds.add(sessionId);
      for (const pendingShell of pendingShells) if (pendingShell.sessionId === sessionId) pendingShell.isClosed = true;
      for (const shell of shellMap.values()) if (shell.sessionId === sessionId) shell.terminal.kill();
    },
    entries: () => Array.from(shellMap, ([shellId, { output, sessionId }]) => ({ output, sessionId, shellId })),
    open: async (sessionId, options) => {
      if (isStopped) throw new InvalidOperationError(Operation.Create, sessionId, "the host is stopping");
      if (closedSessionIds.has(sessionId))
        throw new InvalidOperationError(Operation.Create, sessionId, "the session is closed");
      const pendingShell = { isClosed: false, sessionId };
      pendingShells.add(pendingShell);
      const terminal = await withFinalizerAsync(
        () => spawnShell(options),
        () => {
          pendingShells.delete(pendingShell);
        },
      );
      if (pendingShell.isClosed) {
        terminal.kill();
        throw new InvalidOperationError(
          Operation.Create,
          sessionId,
          "the shell's session or host closed as it started",
        );
      }
      const shellId = crypto.randomUUID();
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
    openSession: (sessionId) => {
      closedSessionIds.delete(sessionId);
    },
    resize: (shellId, cols, rows) => {
      getTerminal(shellId).resize(cols, rows);
    },
    write: (shellId, data) => {
      getTerminal(shellId).write(data);
    },
  };
};
