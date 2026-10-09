import { MachineState } from "#src/models/machine/MachineState";
import { getMachineState } from "#src/services/machine/getMachineState";
import { describe, expect, test } from "vitest";

describe(getMachineState, () => {
  const LARGE_MACHINE_GIGABYTES = 32;
  const SMALL_MACHINE_GIGABYTES = 16;

  test("is idle when a full window sits under the CPU target with room to spare", () => {
    expect.hasAssertions();

    expect(getMachineState(10, 3, 8, LARGE_MACHINE_GIGABYTES)).toBe(MachineState.Idle);
  });

  test("is tight under the memory gate, whatever the CPU", () => {
    expect.hasAssertions();

    expect(getMachineState(0, 3, 3, LARGE_MACHINE_GIGABYTES)).toBe(MachineState.Tight);
  });

  test("is busy before a full window has been sampled", () => {
    expect.hasAssertions();

    expect(getMachineState(10, 2, 8, LARGE_MACHINE_GIGABYTES)).toBe(MachineState.Busy);
  });

  test("is busy with the CPU at its target", () => {
    expect.hasAssertions();

    expect(getMachineState(80, 3, 8, LARGE_MACHINE_GIGABYTES)).toBe(MachineState.Busy);
  });

  test("is busy with free memory at the room line rather than above it", () => {
    expect.hasAssertions();

    expect(getMachineState(10, 3, 6, LARGE_MACHINE_GIGABYTES)).toBe(MachineState.Busy);
  });

  test("judges the same free memory by the machine's RAM, so 3.6 GB is tight on 32 GB and idle on 16 GB", () => {
    expect.hasAssertions();

    expect(getMachineState(23, 3, 3.6, LARGE_MACHINE_GIGABYTES)).toBe(MachineState.Tight);
    expect(getMachineState(23, 3, 3.6, SMALL_MACHINE_GIGABYTES)).toBe(MachineState.Idle);
  });

  test("is tight on a 16 GB machine below its own 2 GB gate", () => {
    expect.hasAssertions();

    expect(getMachineState(0, 3, 1.9, SMALL_MACHINE_GIGABYTES)).toBe(MachineState.Tight);
  });

  test("is busy with no memory reading, whatever the CPU, since neither tight nor idle can be claimed", () => {
    expect.hasAssertions();

    expect(getMachineState(0, 3, undefined, LARGE_MACHINE_GIGABYTES)).toBe(MachineState.Busy);
  });
});
