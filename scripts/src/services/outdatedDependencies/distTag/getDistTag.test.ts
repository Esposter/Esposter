import { getDistTag } from "#src/services/outdatedDependencies/distTag/getDistTag";
import { describe, expect, test } from "vitest";

describe(getDistTag, () => {
  test.each([
    ["a", "a"],
    ["npm:a@a", "a"],
    ["npm:a@5x", "5x"],
  ])("reads the dist-tag of %s", (specifier, expected) => {
    expect.hasAssertions();

    expect(getDistTag(specifier)).toBe(expected);
  });

  test.each(["^0.0.0", "npm:a@^0.0.0"])("reads no dist-tag from the range %s", (specifier) => {
    expect.hasAssertions();

    expect(getDistTag(specifier)).toBe("");
  });
});
