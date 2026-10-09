import { parsePsProcesses } from "#src/services/machine/parsePsProcesses";
import { describe, expect, test } from "vitest";

describe(parsePsProcesses, () => {
  test("reads each process's parent, CPU time and name from its command line", () => {
    expect.hasAssertions();

    const output = `  4321     1 00:00.01 /usr/bin/find / -name x
  4400  4399 1-02:03:04.50 /opt/homebrew/bin/rg --files
  5000  4999 00:31.00 grep foo
`;

    expect(parsePsProcesses(output)).toStrictEqual([
      { commandLine: "/usr/bin/find / -name x", cpuSeconds: 0.01, name: "find", parentProcessId: 1, processId: 4321 },
      {
        commandLine: "/opt/homebrew/bin/rg --files",
        cpuSeconds: 93784.5,
        name: "rg",
        parentProcessId: 4399,
        processId: 4400,
      },
      { commandLine: "grep foo", cpuSeconds: 31, name: "grep", parentProcessId: 4999, processId: 5000 },
    ]);
  });
});
