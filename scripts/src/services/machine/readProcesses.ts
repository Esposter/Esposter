import type { MachineProcess } from "#src/models/machine/MachineProcess";

import { parsePsProcesses } from "#src/services/machine/parsePsProcesses";
import { parseWindowsProcesses } from "#src/services/machine/parseWindowsProcesses";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { getResultAsync } from "@esposter/shared";

// Windows lists processes through CIM, which keeps a parent's id after the parent has gone. Its command line is the
// Full one, as `ps` prints the args of a process on macOS
const WINDOWS_PROCESS_SCRIPT =
  "Get-CimInstance Win32_Process | ForEach-Object { '{0}|{1}|{2}|{3}|{4}' -f $_.ProcessId, $_.ParentProcessId, $_.Name, ($_.KernelModeTime + $_.UserModeTime), $_.CommandLine }";

// Every process with its parent, CPU time and command line, or none where no reader exists or the listing failed
export const readProcesses = async (): Promise<MachineProcess[]> => {
  switch (process.platform) {
    case "darwin":
      return (await getResultAsync(() => runMachineCommand("ps", ["-axo", "pid=,ppid=,time=,args="]))).match(
        parsePsProcesses,
        (error) => {
          console.error(error);
          return [];
        },
      );
    case "win32":
      return (
        await getResultAsync(() =>
          runMachineCommand("powershell", ["-NoProfile", "-NonInteractive", "-Command", WINDOWS_PROCESS_SCRIPT]),
        )
      ).match(parseWindowsProcesses, (error) => {
        console.error(error);
        return [];
      });
    default:
      return [];
  }
};
