import type { WindowsProcess } from "#src/models/machine/WindowsProcess";

import { WINDOWS_TICKS_PER_SECOND } from "#src/services/machine/constants";
import { normalizeProcessName } from "#src/services/machine/normalizeProcessName";

// One process per row, as the PowerShell listing prints it: `pid|parent|name|CPU ticks|executable|command line`. The
// Command line comes last so a `|` inside it stays part of it. A row that is not a process is skipped
const ROW_REGEX =
  /^(?<processId>\d+)\|(?<parentProcessId>\d+)\|(?<name>[^|]+)\|(?<cpuTicks>\d+)\|(?<memory>[^|]*)\|(?<commandLine>.*)$/u;

export const parseWindowsProcesses = (output: string): WindowsProcess[] =>
  output.split("\n").flatMap((line) => {
    const match = ROW_REGEX.exec(line.trim());
    if (!match) return [];
    const [, processId = "", parentProcessId = "", name = "", ticks = "", executablePath = "", commandLine = ""] =
      match;
    return [
      {
        commandLine,
        cpuSeconds: Number(ticks) / WINDOWS_TICKS_PER_SECOND,
        executablePath,
        name: normalizeProcessName(name),
        parentProcessId: Number(parentProcessId),
        processId: Number(processId),
      },
    ];
  });
