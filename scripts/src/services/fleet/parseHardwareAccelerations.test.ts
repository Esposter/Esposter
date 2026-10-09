import { parseHardwareAccelerations } from "#src/services/fleet/parseHardwareAccelerations";
import { describe, expect, test } from "vitest";

describe(parseHardwareAccelerations, () => {
  test("reads the method names under the header line", () => {
    expect.hasAssertions();

    expect(parseHardwareAccelerations("Hardware acceleration methods:\n cuda\n d3d11va\n\n")).toStrictEqual([
      "cuda",
      "d3d11va",
    ]);
  });
});
