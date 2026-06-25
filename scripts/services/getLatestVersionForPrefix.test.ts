import { getLatestVersionForPrefix } from "@/services/getLatestVersionForPrefix";
import { describe, expect, test } from "vitest";

describe(getLatestVersionForPrefix, () => {
  test("returns the highest version within a major prefix", () => {
    expect.hasAssertions();

    expect(getLatestVersionForPrefix(["1.0.0", "1.0.1", "1.1.0"], "1")).toBe("1.1.0");
  });

  test("ignores versions from other majors", () => {
    expect.hasAssertions();

    expect(getLatestVersionForPrefix(["1.0.0", "2.0.0"], "1")).toBe("1.0.0");
  });

  test("returns the highest patch within a major.minor prefix", () => {
    expect.hasAssertions();

    expect(getLatestVersionForPrefix(["1.0.0", "1.0.1", "1.1.0"], "1.0")).toBe("1.0.1");
  });

  test("excludes prereleases", () => {
    expect.hasAssertions();

    expect(getLatestVersionForPrefix(["1.0.0", "1.0.1-rc.0"], "1")).toBe("1.0.0");
  });

  test("throws when no version matches the prefix", () => {
    expect.hasAssertions();

    expect(() => getLatestVersionForPrefix(["2.0.0"], "1")).toThrowErrorMatchingInlineSnapshot(
      `[Error: No published version found for prefix 1]`,
    );
  });
});
