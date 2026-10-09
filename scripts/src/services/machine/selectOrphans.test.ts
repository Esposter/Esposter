import type { MachineProcess } from "#src/models/machine/MachineProcess";

import { selectOrphans } from "#src/services/machine/selectOrphans";
import { describe, expect, test } from "vitest";

const createProcess = (overrides: Partial<MachineProcess>): MachineProcess => ({
  commandLine: "",
  cpuSeconds: 0,
  name: "node",
  parentProcessId: 0,
  processId: 0,
  ...overrides,
});

describe(selectOrphans, () => {
  const processes = [
    createProcess({ commandLine: "find /", cpuSeconds: 31, name: "find", parentProcessId: 999, processId: 10 }),
    createProcess({ cpuSeconds: 31, name: "find", parentProcessId: 20, processId: 11 }),
    createProcess({ cpuSeconds: 30, name: "du", parentProcessId: 999, processId: 12 }),
    createProcess({ cpuSeconds: 40, name: "rg", parentProcessId: 1, processId: 13 }),
    createProcess({ cpuSeconds: 40, name: "node", parentProcessId: 999, processId: 14 }),
    createProcess({ processId: 1 }),
    createProcess({ processId: 20 }),
  ];

  test("selects a search over its CPU threshold whose parent is gone", () => {
    expect.hasAssertions();

    expect(selectOrphans(processes, undefined)).toStrictEqual([processes[0]]);
  });

  test("selects a search reparented to the adopter as an orphan", () => {
    expect.hasAssertions();

    expect(selectOrphans(processes, 1)).toStrictEqual([processes[0], processes[3]]);
  });
});
