import { NODE_PTY_DIRECTORY_NAME } from "#src/services/installer/constants";
import { getHostInstallDirectory } from "#src/services/installer/getHostInstallDirectory";
import { createRequire } from "node:module";
import { join } from "node:path";

// What node-pty's console-list agent does, from inside the single executable: the console processes attached to a
// Shell, sent back to the host that forked this, which ends each of them with the shell
export const runConsoleListAgent = (shellPid: number): void => {
  const installDirectory = getHostInstallDirectory();
  const { getConsoleProcessList } = createRequire(join(installDirectory, "package.json"))(
    join(installDirectory, NODE_PTY_DIRECTORY_NAME, "prebuilds", "win32-x64", "conpty_console_list.node"),
  ) as { getConsoleProcessList: (pid: number) => number[] };
  process.send?.({ consoleProcessList: getConsoleProcessList(shellPid) });
};
