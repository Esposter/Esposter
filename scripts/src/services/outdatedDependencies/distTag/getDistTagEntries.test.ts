import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { getDistTagEntries } from "#src/services/outdatedDependencies/distTag/getDistTagEntries";
import { describe, expect, test } from "vitest";

describe(getDistTagEntries, () => {
  const entry: DependencyEntry = { group: DependencyGroup.Catalog, packageName: "a", specifier: "npm:b@a" };
  const resolvedVersions = new Map([["a", "0.0.0"]]);

  test("carries the dist-tag and the resolved version onto the entry", () => {
    expect.hasAssertions();

    expect(getDistTagEntries([entry], resolvedVersions)).toStrictEqual([
      { ...entry, followTag: "a", resolved: "0.0.0" },
    ]);
  });

  test("leaves out an entry whose specifier is a version range", () => {
    expect.hasAssertions();

    expect(getDistTagEntries([{ ...entry, specifier: "npm:b@^0.0.0" }], resolvedVersions)).toStrictEqual([]);
  });

  test("leaves out an entry the lockfile resolved nothing for", () => {
    expect.hasAssertions();

    expect(getDistTagEntries([entry], new Map())).toStrictEqual([]);
  });
});
