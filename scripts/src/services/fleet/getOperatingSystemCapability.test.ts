import { getOperatingSystemCapability } from "#src/services/fleet/getOperatingSystemCapability";
import { describe, expect, test } from "vitest";

describe(getOperatingSystemCapability, () => {
  test("names each platform the fleet runs on by its capability", () => {
    expect.hasAssertions();

    expect(getOperatingSystemCapability("win32")).toBe("windows");
    expect(getOperatingSystemCapability("darwin")).toBe("macos");
    expect(getOperatingSystemCapability("linux")).toBe("linux");
  });

  test("names a platform the fleet has no name for as none", () => {
    expect.hasAssertions();

    expect(getOperatingSystemCapability("freebsd")).toBeUndefined();
  });
});
