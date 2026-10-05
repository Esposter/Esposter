import type { Shell } from "@/models/agentConsole/Shell";
import type { ShellListener } from "@/models/agentConsole/ShellListener";

import { SHELL_OUTPUT_LENGTH } from "agent-console-server/contracts";

// Every host's shells, and each one's output since the page connected. The output is kept beside the list rather than
// In it: a terminal writes it as it comes, which no reactive read needs, and one opened later is written what came
// Before it
export const useAgentConsoleShellStore = defineStore("agentConsole/shell", () => {
  const shells = ref<Shell[]>([]);
  const currentShellId = ref("");
  const shellOutputMap = new Map<string, string>();
  const shellListenerMap = new Map<string, ShellListener>();

  // A shell the page already holds is being replayed after a reconnect, from the start of what the host kept, so what
  // The page had of it is dropped rather than shown twice
  const storeShellOpened = (shell: Shell) => {
    if (shells.value.some(({ id }) => id === shell.id)) {
      shellOutputMap.delete(shell.id);
      shellListenerMap.get(shell.id)?.reset();
      return;
    }

    shells.value = [...shells.value, shell];
  };
  const storeShellOutput = (shellId: string, data: string) => {
    shellOutputMap.set(shellId, `${shellOutputMap.get(shellId) ?? ""}${data}`.slice(-SHELL_OUTPUT_LENGTH));
    shellListenerMap.get(shellId)?.write(data);
  };
  const storeShellsClosed = (checkIsClosed: (shell: Shell) => boolean) => {
    for (const { id } of shells.value.filter((shell) => checkIsClosed(shell))) {
      shellOutputMap.delete(id);
      shellListenerMap.delete(id);
    }
    shells.value = shells.value.filter((shell) => !checkIsClosed(shell));
  };
  // A terminal is written what the shell printed before it opened, then everything after, until it stops listening
  const listenToShell = (shellId: string, shellListener: ShellListener) => {
    shellListener.write(shellOutputMap.get(shellId) ?? "");
    shellListenerMap.set(shellId, shellListener);
    return () => {
      if (shellListenerMap.get(shellId) === shellListener) shellListenerMap.delete(shellId);
    };
  };

  return { currentShellId, listenToShell, shells, storeShellOpened, storeShellOutput, storeShellsClosed };
});
