import { isPnpmOutdatedDependency } from "@/checkDependencies/isPnpmOutdatedDependency";
import { describe, expect, test } from "vitest";

describe(isPnpmOutdatedDependency, () => {
  test("accepts an object with a string latest field", () => {
    expect.hasAssertions();

    expect(isPnpmOutdatedDependency({ latest: "" })).toBe(true);
  });

  test("rejects a null value", () => {
    expect.hasAssertions();

    expect(isPnpmOutdatedDependency(null)).toBe(false);
  });

  test("rejects an object without a latest field", () => {
    expect.hasAssertions();

    expect(isPnpmOutdatedDependency({})).toBe(false);
  });

  test("rejects a non-string latest field", () => {
    expect.hasAssertions();

    expect(isPnpmOutdatedDependency({ latest: 0 })).toBe(false);
  });
});
