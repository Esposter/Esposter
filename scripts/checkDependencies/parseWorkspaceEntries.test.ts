import { parseWorkspaceEntries } from "@/checkDependencies/parseWorkspaceEntries";
import { describe, expect, test } from "vitest";

describe(parseWorkspaceEntries, () => {
  test("parses each package and specifier line into an entry", () => {
    expect.hasAssertions();

    expect(parseWorkspaceEntries("catalog", "  a: ^0.0.0\n")).toStrictEqual([
      { group: "catalog", pkg: "a", specifier: "^0.0.0" },
    ]);
  });

  test("returns no entries for an empty section", () => {
    expect.hasAssertions();

    expect(parseWorkspaceEntries("catalog", "")).toStrictEqual([]);
  });
});
