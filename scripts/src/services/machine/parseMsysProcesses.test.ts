import { parseMsysProcesses } from "#src/services/machine/parseMsysProcesses";
import { describe, expect, test } from "vitest";

describe(parseMsysProcesses, () => {
  test("keys each MSYS process by its WINPID, reading its MSYS id and MSYS parent and skipping the header", () => {
    expect.hasAssertions();

    // A sample of `ps -W` as Git's ps prints it on Windows, with a native process in it that has no MSYS parent
    const output = `      PID    PPID    PGID     WINPID   TTY         UID    STIME COMMAND
    65540       0       0          4  ?              0 10:16:14 System
    42480       1   42478       7540  ?         197609 13:27:54 /usr/bin/bash
    48333   42552   42552      35496  ?         197609 13:30:35 /usr/bin/sleep
`;

    expect(parseMsysProcesses(output)).toStrictEqual(
      new Map([
        [4, { parentProcessId: 0, processId: 65540 }],
        [7540, { parentProcessId: 1, processId: 42480 }],
        [35496, { parentProcessId: 42552, processId: 48333 }],
      ]),
    );
  });
});
