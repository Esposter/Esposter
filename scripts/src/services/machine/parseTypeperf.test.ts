import { parseTypeperf } from "#src/services/machine/parseTypeperf";
import { describe, expect, test } from "vitest";

describe(parseTypeperf, () => {
  test("sums the GPU 3D instances in the data row", () => {
    expect.hasAssertions();

    const output = String.raw`"(PDH-CSV 4.0) (Pacific Daylight Time)(420)","\\DESKTOP-ABC\GPU Engine(pid_4120_luid_0x00000000_0x0000E8C5_phys_0_eng_0_engtype_3D)\Utilization Percentage","\\DESKTOP-ABC\GPU Engine(pid_9876_luid_0x00000000_0x0000E8C5_phys_0_eng_1_engtype_3D)\Utilization Percentage"
"10/09/2026 14:05:03.123","2.000000","5.000000"

Exiting, please wait...
The command completed successfully.
`;

    expect(parseTypeperf(output)).toBe(7);
  });

  test("reads none when the output holds only the header", () => {
    expect.hasAssertions();

    const output = String.raw`"(PDH-CSV 4.0) (Pacific Daylight Time)(420)","\\DESKTOP-ABC\GPU Engine(engtype_3D)\Utilization Percentage"`;

    expect(parseTypeperf(output)).toBeUndefined();
  });
});
