import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";
import { getMismatches } from "#src/outdatedDependencies/getMismatches";
import { describe, expect, test } from "vitest";

describe(getMismatches, () => {
  const entries = [{ group: DependencyGroup.Catalog, pkg: "a", specifier: "^0.0.0" }];

  test("reports an entry whose specifier base differs from the resolved version", () => {
    expect.hasAssertions();

    expect(getMismatches(entries, new Map([["a", "0.0.1"]]))).toStrictEqual([
      { group: DependencyGroup.Catalog, pkg: "a", resolved: "0.0.1", specifier: "^0.0.0" },
    ]);
  });

  test("reports nothing when the specifier base matches the resolved version", () => {
    expect.hasAssertions();

    expect(getMismatches(entries, new Map([["a", "0.0.0"]]))).toStrictEqual([]);
  });

  test("skips entries that have no resolved version", () => {
    expect.hasAssertions();

    expect(getMismatches(entries, new Map())).toStrictEqual([]);
  });
});
