import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { getOverrideEntries } from "#src/services/outdatedDependencies/workspace/getOverrideEntries";
import { describe, expect, test } from "vitest";

describe(getOverrideEntries, () => {
  test("keeps an override naming its own version, under the package after the last parent", () => {
    expect.hasAssertions();

    expect(
      getOverrideEntries(
        [
          { group: DependencyGroup.Overrides, packageName: "a>b", specifier: "^0.0.0" },
          { group: DependencyGroup.Overrides, packageName: "a", specifier: "catalog:" },
          { group: DependencyGroup.Overrides, packageName: "c", specifier: "^0.0.0" },
        ],
        [{ group: DependencyGroup.Catalog, packageName: "c", specifier: "^0.0.0" }],
      ),
    ).toStrictEqual([{ group: DependencyGroup.Overrides, packageName: "b", specifier: "^0.0.0" }]);
  });

  test("names an override whose key selects versions by its package alone", () => {
    expect.hasAssertions();

    expect(
      getOverrideEntries(
        [
          { group: DependencyGroup.Overrides, packageName: "a@<1.0.0", specifier: "^1.0.0" },
          { group: DependencyGroup.Overrides, packageName: "@b/c@>=1.0.0 <2.0.0", specifier: "^2.0.0" },
          { group: DependencyGroup.Overrides, packageName: "d@1>e@<1.0.0", specifier: "^1.0.0" },
        ],
        [],
      ),
    ).toStrictEqual([
      { group: DependencyGroup.Overrides, packageName: "a", specifier: "^1.0.0" },
      { group: DependencyGroup.Overrides, packageName: "@b/c", specifier: "^2.0.0" },
      { group: DependencyGroup.Overrides, packageName: "e", specifier: "^1.0.0" },
    ]);
  });
});
