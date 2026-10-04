import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { applyDistTags } from "#src/services/outdatedDependencies/distTag/applyDistTags";
import { describe, expect, test } from "vitest";

describe(applyDistTags, () => {
  const entry: DependencyEntry = { group: DependencyGroup.Catalog, packageName: "a", specifier: "npm:b@a" };
  const resolvedVersions = new Map([["a", "0.0.0"]]);

  test("carries the dist-tag and the resolved version onto the entry", () => {
    expect.hasAssertions();

    expect(applyDistTags([entry], resolvedVersions)).toStrictEqual([{ ...entry, followTag: "a", resolved: "0.0.0" }]);
  });

  test("leaves an entry whose specifier is a version range as it is", () => {
    expect.hasAssertions();

    const rangeEntry = { ...entry, specifier: "npm:b@^0.0.0" };

    expect(applyDistTags([rangeEntry], resolvedVersions)).toStrictEqual([rangeEntry]);
  });

  test("leaves out a dist-tag entry the lockfile resolved nothing for", () => {
    expect.hasAssertions();

    expect(applyDistTags([entry], new Map())).toStrictEqual([]);
  });
});
