import type { MachineProcess } from "#src/models/machine/MachineProcess";
import type { MsysProcess } from "#src/models/machine/MsysProcess";
import type { WindowsProcess } from "#src/models/machine/WindowsProcess";

import { checkIsMsysExecutable } from "#src/services/machine/checkIsMsysExecutable";
import { parseMsysProcesses } from "#src/services/machine/parseMsysProcesses";
import { parsePsProcesses } from "#src/services/machine/parsePsProcesses";
import { parseWindowsProcesses } from "#src/services/machine/parseWindowsProcesses";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { getResultAsync } from "@esposter/shared";

// Windows lists processes through CIM, which keeps a parent's id after the parent has gone. Its command line is the
// Full one, as `ps` prints the args of a process on macOS, and its executable says whether the process is an MSYS one
const WINDOWS_PROCESS_SCRIPT =
  "Get-CimInstance Win32_Process | ForEach-Object { '{0}|{1}|{2}|{3}|{4}|{5}' -f $_.ProcessId, $_.ParentProcessId, $_.Name, ($_.KernelModeTime + $_.UserModeTime), $_.ExecutablePath, $_.CommandLine }";

// Git's own `ps` sits beside the MSYS tools, and is the only reader of the MSYS process table an MSYS parent lives in
const readMsysProcesses = async (executablePath: string): Promise<Map<number, MsysProcess>> => {
  const gitPsPath = `${executablePath.slice(0, executablePath.lastIndexOf("\\"))}\\ps.exe`;
  return parseMsysProcesses(await runMachineCommand(gitPsPath, ["-W"]));
};

// A Windows process list where each MSYS process carries its MSYS identity. An MSYS process whose identity cannot be read
// Is left out, and when Git's ps itself cannot be read the list is empty, so a tick sweeps nothing rather than a live run
const readWindowsProcesses = async (): Promise<MachineProcess[]> => {
  const windowsProcesses = (
    await getResultAsync(() =>
      runMachineCommand("powershell", ["-NoProfile", "-NonInteractive", "-Command", WINDOWS_PROCESS_SCRIPT]),
    )
  ).match(parseWindowsProcesses, (error) => {
    console.error(error);
    return [];
  });
  const msysExecutable = windowsProcesses.find(({ executablePath }) => checkIsMsysExecutable(executablePath));
  if (msysExecutable === undefined) return windowsProcesses;
  return (await getResultAsync(() => readMsysProcesses(msysExecutable.executablePath))).match(
    (msysProcesses) =>
      windowsProcesses.flatMap((windowsProcess): MachineProcess[] => {
        if (!checkIsMsysExecutable(windowsProcess.executablePath)) return [windowsProcess];
        const msys = msysProcesses.get(windowsProcess.processId);
        return msys === undefined ? [] : [{ ...windowsProcess, msys }];
      }),
    (error) => {
      console.error(error);
      return [];
    },
  );
};

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
      return readWindowsProcesses();
    default:
      return [];
  }
};
