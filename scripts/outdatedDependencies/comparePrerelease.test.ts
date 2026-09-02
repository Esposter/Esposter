import { comparePrerelease } from "#scripts/outdatedDependencies/comparePrerelease";
import { describe, expect, test } from "vitest";

describe(comparePrerelease, () => {
  test("treats two missing prereleases as equal", () => {
    expect.hasAssertions();

    expect(comparePrerelease("", "")).toBe(0);
  });

  test("ranks a missing left prerelease (stable) above a present one", () => {
    expect.hasAssertions();

    expect(comparePrerelease("", "0")).toBe(1);
  });

  test("ranks a missing right prerelease (stable) above a present one", () => {
    expect.hasAssertions();

    expect(comparePrerelease("0", "")).toBe(-1);
  });

  test("compares present prereleases numerically", () => {
    expect.hasAssertions();

    expect(Math.sign(comparePrerelease("0", "1"))).toBe(-1);
  });
});
