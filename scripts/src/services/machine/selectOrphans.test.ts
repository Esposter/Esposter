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
  // Git's bash, MSYS process 200, runs under claude.exe, and a `du` runs under that bash
  const bash = createProcess({
    msys: { parentProcessId: 1, processId: 200 },
    name: "bash",
    parentProcessId: 40,
    processId: 210,
  });
  const claude = createProcess({ name: "claude", processId: 40 });

  test("selects a search over its CPU threshold whose parent is gone", () => {
    expect.hasAssertions();

    expect(selectOrphans(processes, undefined)).toStrictEqual([processes[0]]);
  });

  test("selects a search reparented to the adopter as an orphan", () => {
    expect.hasAssertions();

    expect(selectOrphans(processes, 1)).toStrictEqual([processes[0], processes[3]]);
  });

  test("keeps an MSYS search whose Win32 parent is gone while its MSYS parent, the bash running it, is alive", () => {
    expect.hasAssertions();

    const du = createProcess({
      cpuSeconds: 31,
      msys: { parentProcessId: 200, processId: 201 },
      name: "du",
      parentProcessId: 999,
      processId: 300,
    });

    expect(selectOrphans([bash, claude, du], undefined)).toStrictEqual([]);
  });

  test("selects an MSYS search whose MSYS parent and Win32 parent are both gone", () => {
    expect.hasAssertions();

    const du = createProcess({
      cpuSeconds: 31,
      msys: { parentProcessId: 200, processId: 201 },
      name: "du",
      parentProcessId: 999,
      processId: 300,
    });

    expect(selectOrphans([claude, du], undefined)).toStrictEqual([du]);
  });

  test("keeps an MSYS search reparented to MSYS init while a live Windows process above it is listed", () => {
    expect.hasAssertions();

    const du = createProcess({
      cpuSeconds: 31,
      msys: { parentProcessId: 1, processId: 201 },
      name: "du",
      parentProcessId: 40,
      processId: 300,
    });

    expect(selectOrphans([claude, du], undefined)).toStrictEqual([]);
  });
});
