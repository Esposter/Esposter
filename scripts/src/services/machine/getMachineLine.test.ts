import { MachineState } from "#src/models/machine/MachineState";
import { getMachineLine } from "#src/services/machine/getMachineLine";
import { describe, expect, test } from "vitest";

describe(getMachineLine, () => {
  test("prints an idle line on the change into idle", () => {
    expect.hasAssertions();

    expect(getMachineLine(MachineState.Idle, MachineState.Busy, 0, "CPU 10%")).toBe(
      "machine idle: CPU 10% - room for more runs",
    );
  });

  test("prints a tight line on the first reading when it is tight", () => {
    expect.hasAssertions();

    expect(getMachineLine(MachineState.Tight, undefined, 0, "CPU 10%")).toBe("machine tight: CPU 10% - hold new runs");
  });

  test("prints nothing for a busy state on its first reading", () => {
    expect.hasAssertions();

    expect(getMachineLine(MachineState.Busy, undefined, 0, "CPU 90%")).toBeUndefined();
  });

  test("prints a busy line on the change out of idle", () => {
    expect.hasAssertions();

    expect(getMachineLine(MachineState.Busy, MachineState.Idle, 0, "CPU 90%")).toBe("machine busy: CPU 90%");
  });

  test("prints nothing while a state holds between reminders", () => {
    expect.hasAssertions();

    expect(getMachineLine(MachineState.Idle, MachineState.Idle, 14, "CPU 10%")).toBeUndefined();
  });

  test("reminds an idle or tight state every fifteen minutes it holds", () => {
    expect.hasAssertions();

    expect(getMachineLine(MachineState.Tight, MachineState.Tight, 15, "CPU 10%")).toBe(
      "machine tight: CPU 10% - hold new runs",
    );
  });

  test("never reminds a busy state", () => {
    expect.hasAssertions();

    expect(getMachineLine(MachineState.Busy, MachineState.Busy, 15, "CPU 90%")).toBeUndefined();
  });
});
