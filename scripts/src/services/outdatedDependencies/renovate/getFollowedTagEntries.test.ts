import type { DependencyEntry } from "#src/models/outdatedDependencies/DependencyEntry";
import type { RenovateRule } from "#src/models/outdatedDependencies/RenovateRule";

import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";
import { getFollowedTagEntries } from "#src/services/outdatedDependencies/renovate/getFollowedTagEntries";
import { describe, expect, test } from "vitest";

describe(getFollowedTagEntries, () => {
  const entry: DependencyEntry = { group: DependencyGroup.Catalog, packageName: "a", specifier: "1.0.0-rc.0" };
  const followed: RenovateRule = { followTag: "rc", matchPackageNames: ["a"] };

  test("carries the followed tag onto the entry the rule names", () => {
    expect.hasAssertions();

    expect(getFollowedTagEntries([entry], [followed])).toStrictEqual([{ ...entry, followTag: "rc" }]);
  });

  test("leaves out an entry no rule follows a tag for", () => {
    expect.hasAssertions();

    expect(getFollowedTagEntries([entry], [{ enabled: false, matchPackageNames: ["a"] }])).toStrictEqual([]);
  });

  test("a later rule's followTag overrides an earlier one's, as in Renovate", () => {
    expect.hasAssertions();

    expect(getFollowedTagEntries([entry], [followed, { ...followed, followTag: "beta" }])).toStrictEqual([
      { ...entry, followTag: "beta" },
    ]);
  });
});
