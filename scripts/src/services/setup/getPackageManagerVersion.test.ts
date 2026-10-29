import { getPackageManagerVersion } from "#src/services/setup/getPackageManagerVersion";
import { describe, expect, test } from "vitest";

describe(getPackageManagerVersion, () => {
  test("drops the corepack hash that follows the version", () => {
    expect.hasAssertions();

    expect(getPackageManagerVersion("pnpm@12.16.1+sha512.abc")).toBe("12.16.1");
  });

  test("reads the empty string when there is no pin", () => {
    expect.hasAssertions();

    expect(getPackageManagerVersion(undefined)).toBe("");
  });
});
