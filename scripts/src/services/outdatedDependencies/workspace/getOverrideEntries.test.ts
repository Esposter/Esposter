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
});
