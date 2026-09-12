import { checkIsVersionOutdated } from "#src/services/outdatedDependencies/registry/checkIsVersionOutdated";
import { describe, expect, test } from "vitest";

describe(checkIsVersionOutdated, () => {
  const current = "0.0.0";

  test("is outdated when the latest base is higher", () => {
    expect.hasAssertions();

    expect(checkIsVersionOutdated(current, "0.0.1")).toBe(true);
  });

  test("is not outdated when the latest base is lower", () => {
    expect.hasAssertions();

    expect(checkIsVersionOutdated("0.0.1", current)).toBe(false);
  });

  test("is outdated when the same base has a higher prerelease build", () => {
    expect.hasAssertions();

    expect(checkIsVersionOutdated("0.0.0-dev.0", "0.0.0-dev.1")).toBe(true);
  });

  test("is not outdated when the same base has a lower prerelease build", () => {
    expect.hasAssertions();

    expect(checkIsVersionOutdated("0.0.0-dev.1", "0.0.0-dev.0")).toBe(false);
  });

  test("is outdated when a prerelease graduates to the stable release", () => {
    expect.hasAssertions();

    expect(checkIsVersionOutdated("0.0.0-dev.0", current)).toBe(true);
  });

  test("is not outdated when the versions are identical", () => {
    expect.hasAssertions();

    expect(checkIsVersionOutdated(current, current)).toBe(false);
  });
});
