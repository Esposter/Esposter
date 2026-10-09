import type { MachineProcess } from "#src/models/machine/MachineProcess";

import { normalizeProcessName } from "#src/services/machine/normalizeProcessName";
import { parseCpuTime } from "#src/services/machine/parseCpuTime";

// One process per row, as `ps -axo pid=,ppid=,time=,args=` prints it, with no header to skip. The name is the first
// Word of the command line without its path, and a row that is not a process is skipped
const ROW_REGEX = /^(?<processId>\d+)\s+(?<parentProcessId>\d+)\s+(?<time>\S+)\s+(?<commandLine>.*)$/u;

export const parsePsProcesses = (output: string): MachineProcess[] =>
  output.split("\n").flatMap((line) => {
    const match = ROW_REGEX.exec(line.trim());
    if (!match) return [];
    const [, processId = "", parentProcessId = "", time = "", commandLine = ""] = match;
    const [executable = ""] = commandLine.split(" ");
    return [
      {
        commandLine,
        cpuSeconds: parseCpuTime(time),
        name: normalizeProcessName(executable.split("/").pop() ?? ""),
        parentProcessId: Number(parentProcessId),
        processId: Number(processId),
      },
    ];
  });
