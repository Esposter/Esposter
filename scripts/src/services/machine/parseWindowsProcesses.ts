import type { MachineProcess } from "#src/models/machine/MachineProcess";

import { WINDOWS_TICKS_PER_SECOND } from "#src/services/machine/constants";
import { normalizeProcessName } from "#src/services/machine/normalizeProcessName";

// One process per row, as the PowerShell listing prints it: `pid|parent|name|CPU ticks|command line`. The command line
// Comes last so a `|` inside it stays part of it. A row that is not a process is skipped
const ROW_REGEX = /^(\d+)\|(\d+)\|([^|]+)\|(\d+)\|(.*)$/;

export const parseWindowsProcesses = (output: string): MachineProcess[] =>
  output.split("\n").flatMap((line) => {
    const match = ROW_REGEX.exec(line.trim());
    if (!match) return [];
    const [, processId = "", parentProcessId = "", name = "", ticks = "", commandLine = ""] = match;
    return [
      {
        commandLine,
        cpuSeconds: Number(ticks) / WINDOWS_TICKS_PER_SECOND,
        name: normalizeProcessName(name),
        parentProcessId: Number(parentProcessId),
        processId: Number(processId),
      },
    ];
  });
