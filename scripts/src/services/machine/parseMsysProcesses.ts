import type { MsysProcess } from "#src/models/machine/MsysProcess";

// One process per row, as `ps -W` prints it: `PID PPID PGID WINPID TTY UID STIME COMMAND`. The header and any row that
// Is not a process do not start with digits, so they are skipped. Keyed by WINPID, the id the Win32 listing names it by
const ROW_REGEX = /^\s*(\d+)\s+(\d+)\s+\d+\s+(\d+)\s/;

export const parseMsysProcesses = (output: string): Map<number, MsysProcess> =>
  new Map(
    output.split("\n").flatMap((line) => {
      const match = ROW_REGEX.exec(line);
      if (!match) return [];
      const [, processId = "", parentProcessId = "", windowsProcessId = ""] = match;
      return [[Number(windowsProcessId), { parentProcessId: Number(parentProcessId), processId: Number(processId) }]];
    }),
  );
