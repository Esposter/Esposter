import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { describe, expect, test } from "vitest";

describe(formatMachineLoad, () => {
  test("names a win32 heartbeat's GPU figure GPU 3D, the 3D engine alone", () => {
    expect.hasAssertions();

    expect(formatMachineLoad(12.4, 3.6, 20.04, "win32")).toBe("CPU 12%, GPU 3D 4%, 20.0 GB free");
  });

  test("names a darwin heartbeat's GPU figure GPU, the whole GPU's busy time", () => {
    expect.hasAssertions();

    expect(formatMachineLoad(12.4, 3.6, 20.04, "darwin")).toBe("CPU 12%, GPU 4%, 20.0 GB free");
  });

  test("names a heartbeat with no platform's GPU figure GPU", () => {
    expect.hasAssertions();

    expect(formatMachineLoad(12.4, 3.6, 20.04, undefined)).toBe("CPU 12%, GPU 4%, 20.0 GB free");
  });

  test("reads a GPU no reader measured as none, not as a percentage", () => {
    expect.hasAssertions();

    expect(formatMachineLoad(0, undefined, 8, "darwin")).toBe("CPU 0%, GPU none, 8.0 GB free");
  });

  test("reads a free memory no reader measured as none, not as a figure", () => {
    expect.hasAssertions();

    expect(formatMachineLoad(0, 0, undefined, "win32")).toBe("CPU 0%, GPU 3D 0%, none free");
  });
});
