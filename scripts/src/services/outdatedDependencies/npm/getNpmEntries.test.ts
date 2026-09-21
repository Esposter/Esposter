import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";
import { getNpmEntries } from "#src/services/outdatedDependencies/npm/getNpmEntries";
import { describe, expect, test } from "vitest";

describe(getNpmEntries, () => {
  test("reads every dependency field under the manifest's name", () => {
    expect.hasAssertions();

    expect(
      getNpmEntries("manifestName", { dependencies: { a: "^0.0.0" }, devDependencies: { b: "^0.0.1" } }),
    ).toStrictEqual([
      { dependent: "manifestName", group: DependencyGroup.Npm, packageName: "a", specifier: "^0.0.0" },
      { dependent: "manifestName", group: DependencyGroup.Npm, packageName: "b", specifier: "^0.0.1" },
    ]);
  });

  test("returns an empty array for a manifest declaring nothing", () => {
    expect.hasAssertions();

    expect(getNpmEntries("", {})).toStrictEqual([]);
  });
});
