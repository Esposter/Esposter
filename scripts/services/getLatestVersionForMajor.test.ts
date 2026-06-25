import { getLatestVersionForMajor } from "@/services/getLatestVersionForMajor";
import { describe, expect, test } from "vitest";

describe(getLatestVersionForMajor, () => {
  test("returns the highest version within the requested major", () => {
    expect.hasAssertions();

    expect(getLatestVersionForMajor(["1.0.0", "1.1.0", "1.0.5"], 1)).toBe("1.1.0");
  });

  test("ignores versions from other majors", () => {
    expect.hasAssertions();

    expect(getLatestVersionForMajor(["0.0.0", "1.0.0", "1.1.0", "2.0.0"], 1)).toBe("1.1.0");
  });

  test("excludes prereleases", () => {
    expect.hasAssertions();

    expect(getLatestVersionForMajor(["1.0.0", "1.1.0-rc.0"], 1)).toBe("1.0.0");
  });

  test("throws when no version matches the major", () => {
    expect.hasAssertions();

    expect(() => getLatestVersionForMajor(["0.0.0", "2.0.0"], 1)).toThrowErrorMatchingInlineSnapshot(
      `[Error: No published version found for major 1]`,
    );
  });
});
