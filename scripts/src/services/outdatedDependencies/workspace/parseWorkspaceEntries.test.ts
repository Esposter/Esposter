import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { describe, expect, test } from "vitest";

describe(parseWorkspaceEntries, () => {
  test("parses each package and specifier line into an entry", () => {
    expect.hasAssertions();

    expect(parseWorkspaceEntries(DependencyGroup.Catalog, "  a: ^0.0.0\n")).toStrictEqual([
      { group: DependencyGroup.Catalog, pkg: "a", specifier: "^0.0.0" },
    ]);
  });

  test("returns no entries for an empty section", () => {
    expect.hasAssertions();

    expect(parseWorkspaceEntries(DependencyGroup.Catalog, "")).toStrictEqual([]);
  });
});
