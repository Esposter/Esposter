import { parseVersion } from "#src/services/semver/parseVersion";
import { describe, expect, test } from "vitest";

describe(parseVersion, () => {
  test.each([
    ["1.0.0", "1", "0", "0", []],
    ["2.1.0", "2", "1", "0", []],
    ["3.2.1", "3", "2", "1", []],
    ["v1.2.3", "1", "2", "3", []],
    ["1.2.3-0", "1", "2", "3", ["0"]],
    ["1.2.3-123", "1", "2", "3", ["123"]],
    ["1.2.3-1.2.3", "1", "2", "3", ["1", "2", "3"]],
    ["1.2.3-1a", "1", "2", "3", ["1a"]],
    ["1.2.3-a1", "1", "2", "3", ["a1"]],
    ["1.2.3-alpha", "1", "2", "3", ["alpha"]],
    ["1.2.3-alpha.1", "1", "2", "3", ["alpha", "1"]],
    ["1.2.3-alpha-1", "1", "2", "3", ["alpha-1"]],
    ["1.2.3-alpha-.-beta", "1", "2", "3", ["alpha-", "-beta"]],
    ["1.2.3+456", "1", "2", "3", []],
    ["1.2.3+build", "1", "2", "3", []],
    ["1.2.3+new-build", "1", "2", "3", []],
    ["1.2.3+build.1", "1", "2", "3", []],
    ["1.2.3+build.1a", "1", "2", "3", []],
    ["1.2.3+build.a1", "1", "2", "3", []],
    ["1.2.3+build.alpha", "1", "2", "3", []],
    ["1.2.3+build.alpha.beta", "1", "2", "3", []],
    ["1.2.3-alpha+build", "1", "2", "3", ["alpha"]],
  ])("parses %s", (version, major, minor, patch, prerelease) => {
    expect.hasAssertions();

    expect(parseVersion(version)).toStrictEqual({ major, minor, patch, prerelease });
  });

  test.each(["hello, world"])("rejects %s", (version) => {
    expect.hasAssertions();

    expect(parseVersion(version)).toBeUndefined();
  });

  test("accepts a leading zero in a prerelease identifier that is not numeric, the SemVer rule (upstream #243)", () => {
    expect.hasAssertions();

    expect(parseVersion("1.0.0-0beta.1")).toStrictEqual({
      major: "1",
      minor: "0",
      patch: "0",
      prerelease: ["0beta", "1"],
    });
  });

  test("rejects a numeric prerelease identifier with a leading zero (upstream #237)", () => {
    expect.hasAssertions();

    expect(parseVersion("1.0.0-01")).toBeUndefined();
  });

  test("accepts hyphens inside a prerelease identifier, as SemVer item 9 allows (upstream #686)", () => {
    expect.hasAssertions();

    expect(parseVersion("1.2.3-foo-bar")).toStrictEqual({
      major: "1",
      minor: "2",
      patch: "3",
      prerelease: ["foo-bar"],
    });
  });
});
