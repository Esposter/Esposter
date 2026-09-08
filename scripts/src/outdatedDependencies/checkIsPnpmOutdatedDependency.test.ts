import { checkIsPnpmOutdatedDependency } from "#src/outdatedDependencies/checkIsPnpmOutdatedDependency";
import { describe, expect, test } from "vitest";

describe(checkIsPnpmOutdatedDependency, () => {
  test("accepts an object with a string latest field", () => {
    expect.hasAssertions();

    expect(checkIsPnpmOutdatedDependency({ latest: "" })).toBe(true);
  });

  test("rejects a null value", () => {
    expect.hasAssertions();

    expect(checkIsPnpmOutdatedDependency(null)).toBe(false);
  });

  test("rejects an object without a latest field", () => {
    expect.hasAssertions();

    expect(checkIsPnpmOutdatedDependency({})).toBe(false);
  });

  test("rejects a non-string latest field", () => {
    expect.hasAssertions();

    expect(checkIsPnpmOutdatedDependency({ latest: 0 })).toBe(false);
  });
});
