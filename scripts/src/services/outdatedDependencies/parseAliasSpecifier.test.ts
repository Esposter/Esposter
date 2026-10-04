import { parseAliasSpecifier } from "#src/services/outdatedDependencies/parseAliasSpecifier";
import { describe, expect, test } from "vitest";

describe(parseAliasSpecifier, () => {
  test.each([
    ["npm:a@^0.0.0", { packageName: "a", range: "^0.0.0" }],
    ["npm:@a/b@a", { packageName: "@a/b", range: "a" }],
    ["npm:a", { packageName: "a", range: "latest" }],
    ["npm:@a/b", { packageName: "@a/b", range: "latest" }],
  ])("reads the target and range of %s", (specifier, expected) => {
    expect.hasAssertions();

    expect(parseAliasSpecifier(specifier)).toStrictEqual(expected);
  });

  test("reads nothing from a specifier that is not an alias", () => {
    expect.hasAssertions();

    expect(parseAliasSpecifier("^0.0.0")).toBeUndefined();
  });
});
