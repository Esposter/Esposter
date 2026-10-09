import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { describe, expect, test } from "vitest";

describe(formatMachineLoad, () => {
  test("reads the CPU and GPU percentages and the free memory", () => {
    expect.hasAssertions();

    expect(formatMachineLoad(12.4, 3.6, 20.04)).toBe("CPU 12%, GPU 3D 4%, 20.0 GB free");
  });

  test("reads a GPU no reader measured as none, not as a percentage", () => {
    expect.hasAssertions();

    expect(formatMachineLoad(0, undefined, 8)).toBe("CPU 0%, GPU 3D none, 8.0 GB free");
  });
});
