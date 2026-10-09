import { parseIoregDeviceUtilization } from "#src/services/machine/parseIoregDeviceUtilization";
import { describe, expect, test } from "vitest";

describe(parseIoregDeviceUtilization, () => {
  test("reads the device utilisation from the accelerator's performance statistics", () => {
    expect.hasAssertions();

    const output = `+-o AGXAcceleratorG14X  <class AGXAcceleratorG14X>
    {
      "PerformanceStatistics" = {"Renderer Utilization %"=4,"Device Utilization %"=12,"Tiler Utilization %"=3}
    }`;

    expect(parseIoregDeviceUtilization(output)).toBe(12);
  });

  test("reads none when the accelerator reports no device utilisation", () => {
    expect.hasAssertions();

    expect(parseIoregDeviceUtilization("+-o AGXAcceleratorG14X  <class AGXAcceleratorG14X>")).toBeUndefined();
  });
});
