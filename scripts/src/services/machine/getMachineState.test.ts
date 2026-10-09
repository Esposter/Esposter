import { MachineState } from "#src/models/machine/MachineState";
import { getMachineState } from "#src/services/machine/getMachineState";
import { describe, expect, test } from "vitest";

describe(getMachineState, () => {
  test("is idle when a full window sits under the CPU target with room to spare", () => {
    expect.hasAssertions();

    expect(getMachineState(10, 3, 8)).toBe(MachineState.Idle);
  });

  test("is tight under the memory gate, whatever the CPU", () => {
    expect.hasAssertions();

    expect(getMachineState(0, 3, 3)).toBe(MachineState.Tight);
  });

  test("is busy before a full window has been sampled", () => {
    expect.hasAssertions();

    expect(getMachineState(10, 2, 8)).toBe(MachineState.Busy);
  });

  test("is busy with the CPU at its target", () => {
    expect.hasAssertions();

    expect(getMachineState(80, 3, 8)).toBe(MachineState.Busy);
  });

  test("is busy with free memory at the room line rather than above it", () => {
    expect.hasAssertions();

    expect(getMachineState(10, 3, 6)).toBe(MachineState.Busy);
  });
});
