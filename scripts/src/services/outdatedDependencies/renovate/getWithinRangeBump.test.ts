import type { RenovateRule } from "#src/models/outdatedDependencies/renovate/RenovateRule";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/shared/OutdatedDependency";

import { getWithinRangeBump } from "#src/services/outdatedDependencies/renovate/getWithinRangeBump";
import { describe, expect, test } from "vitest";

describe(getWithinRangeBump, () => {
  const dependency: OutdatedDependency = {
    current: "1.2.16",
    dependencyType: "",
    dependents: [],
    latest: "1.3.1",
    packageName: "a",
  };
  const specifier = "~1.2.16";
  const capped: RenovateRule = { allowedVersions: "<1.3", matchPackageNames: ["a"] };
  const versions = ["1.2.16", "1.2.18", "1.3.0", "1.3.1"];

  test("bumps to the newest version the specifier and the cap both admit", () => {
    expect.hasAssertions();

    expect(getWithinRangeBump(dependency, specifier, capped, versions)).toStrictEqual({
      ...dependency,
      latest: "1.2.18",
    });
  });

  test("is undefined when the current version is already the newest in range", () => {
    expect.hasAssertions();

    expect(getWithinRangeBump({ ...dependency, current: "1.2.18" }, specifier, capped, versions)).toBeUndefined();
  });

  test("is undefined for a disabled package, whatever its specifier admits", () => {
    expect.hasAssertions();

    expect(
      getWithinRangeBump(dependency, specifier, { enabled: false, matchPackageNames: ["a"] }, versions),
    ).toBeUndefined();
  });

  test("ignores a prerelease that is newer and in range", () => {
    expect.hasAssertions();

    expect(getWithinRangeBump(dependency, specifier, capped, [...versions, "1.2.19-rc.1"])).toStrictEqual({
      ...dependency,
      latest: "1.2.18",
    });
  });

  test("is undefined for a rule with no allowedVersions to stay within", () => {
    expect.hasAssertions();

    expect(getWithinRangeBump(dependency, specifier, { matchPackageNames: ["a"] }, versions)).toBeUndefined();
  });
});
