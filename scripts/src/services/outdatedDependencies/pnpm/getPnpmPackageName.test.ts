import { getPnpmPackageName } from "#src/services/outdatedDependencies/pnpm/getPnpmPackageName";
import { describe, expect, test } from "vitest";

describe(getPnpmPackageName, () => {
  test.each([
    ["a@1.0.0", "1.0.0", "a"],
    ["a@1.0.0 (dev)", "1.0.0", "a"],
    ["@a/b@1.0.0", "1.0.0", "@a/b"],
    ["a", "1.0.0", "a"],
    ["@a/b", "1.0.0", "@a/b"],
  ])("names the package behind the key %s", (key, current, expected) => {
    expect.hasAssertions();

    expect(getPnpmPackageName(key, current)).toBe(expected);
  });
});
