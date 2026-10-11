import { compareVersions } from "#src/services/semver/compareVersions";
import { parseVersion } from "#src/services/semver/parseVersion";
import { describe, expect, test } from "vitest";

describe(compareVersions, () => {
  test.each([
    ["0.0.0", "0.0.0-foo"],
    ["0.0.1", "0.0.0"],
    ["1.0.0", "0.9.9"],
    ["0.10.0", "0.9.0"],
    ["0.99.0", "0.10.0"],
    ["2.0.0", "1.2.3"],
    ["1.2.3", "1.2.3-asdf"],
    ["1.2.3", "1.2.3-4"],
    ["1.2.3", "1.2.3-4-foo"],
    ["1.2.3-5-foo", "1.2.3-5"],
    ["1.2.3-5", "1.2.3-4"],
    ["1.2.3-5-foo", "1.2.3-5-Foo"],
    ["3.0.0", "2.7.2+asdf"],
    ["1.2.3-a.10", "1.2.3-a.5"],
    ["1.2.3-a.b", "1.2.3-a.5"],
    ["1.2.3-a.b", "1.2.3-a"],
    ["1.2.3-a.b.c.10.d.5", "1.2.3-a.b.c.5.d.100"],
    ["1.2.3-r2", "1.2.3-r100"],
    ["1.2.3-r100", "1.2.3-R2"],
  ])("ranks %s above %s", (greater, lesser) => {
    expect.hasAssertions();

    const greaterVersion = parseVersion(greater);
    const lesserVersion = parseVersion(lesser);
    expect(greaterVersion && lesserVersion && compareVersions(greaterVersion, lesserVersion)).toBeGreaterThan(0);
    expect(greaterVersion && lesserVersion && compareVersions(lesserVersion, greaterVersion)).toBeLessThan(0);
  });

  test("ranks versions differing only in build metadata equal", () => {
    expect.hasAssertions();

    const firstVersion = parseVersion("1.2.3+build.1");
    const secondVersion = parseVersion("1.2.3+build.2");
    expect(firstVersion && secondVersion && compareVersions(firstVersion, secondVersion)).toBe(0);
  });
});
