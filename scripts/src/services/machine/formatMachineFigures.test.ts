import { formatMachineFigures } from "#src/services/machine/formatMachineFigures";
import { describe, expect, test } from "vitest";

describe(formatMachineFigures, () => {
  test("formats the CPU, GPU and free memory of a reading", () => {
    expect.hasAssertions();

    expect(formatMachineFigures(12.4, 3, 7.6, 8.04, "win32")).toBe("CPU 12% over 3 min, GPU 3D 8%, 8.0 GB free");
  });

  test("reports a GPU with no reader as none rather than as 0", () => {
    expect.hasAssertions();

    expect(formatMachineFigures(12.4, 3, undefined, 8.04, "win32")).toBe(
      "CPU 12% over 3 min, GPU 3D none, 8.0 GB free",
    );
  });

  test("names macOS's figure GPU, since its reader measures the whole GPU and not the 3D engine alone", () => {
    expect.hasAssertions();

    expect(formatMachineFigures(12.4, 3, 7.6, 8.04, "darwin")).toBe("CPU 12% over 3 min, GPU 8%, 8.0 GB free");
  });
});
