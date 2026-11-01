import type { MsysProcess } from "#src/models/machine/MsysProcess";

import { parseMsysProcesses } from "#src/services/machine/parseMsysProcesses";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";

// Git's own `ps` sits beside the MSYS tools, and is the only reader of the MSYS process table an MSYS parent lives in
export const readMsysProcesses = async (executablePath: string): Promise<Map<number, MsysProcess>> => {
  const gitPsPath = `${executablePath.slice(0, executablePath.lastIndexOf("\\"))}\\ps.exe`;
  return parseMsysProcesses(await runMachineCommand(gitPsPath, ["-W"]));
};
