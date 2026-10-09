import { parseWindowsProcesses } from "#src/services/machine/parseWindowsProcesses";
import { describe, expect, test } from "vitest";

describe(parseWindowsProcesses, () => {
  test("reads each process's parent, CPU seconds, name and executable, keeping a pipe inside its command line", () => {
    expect.hasAssertions();

    const output = String.raw`4120|1|find.exe|1234567890|C:\Program Files\Git\usr\bin\find.exe|find / -name x
9876|4120|RG.EXE|0||rg --files | more

`;

    expect(parseWindowsProcesses(output)).toStrictEqual([
      {
        commandLine: "find / -name x",
        cpuSeconds: 123.456789,
        executablePath: String.raw`C:\Program Files\Git\usr\bin\find.exe`,
        name: "find",
        parentProcessId: 1,
        processId: 4120,
      },
      {
        commandLine: "rg --files | more",
        cpuSeconds: 0,
        executablePath: "",
        name: "rg",
        parentProcessId: 4120,
        processId: 9876,
      },
    ]);
  });
});
