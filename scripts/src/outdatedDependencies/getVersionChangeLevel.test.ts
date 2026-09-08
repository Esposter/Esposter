import { getVersionChangeLevel } from "#scripts/outdatedDependencies/getVersionChangeLevel";
import { VersionChangeLevel } from "#scripts/outdatedDependencies/models/VersionChangeLevel";
import { describe, expect, test } from "vitest";

describe(getVersionChangeLevel, () => {
  const current = "0.0.0";

  test("returns Major for a major change", () => {
    expect.hasAssertions();

    expect(getVersionChangeLevel(current, "1.0.0")).toBe(VersionChangeLevel.Major);
  });

  test("returns Minor for a minor change", () => {
    expect.hasAssertions();

    expect(getVersionChangeLevel(current, "0.1.0")).toBe(VersionChangeLevel.Minor);
  });

  test("returns Patch for a patch change", () => {
    expect.hasAssertions();

    expect(getVersionChangeLevel(current, "0.0.1")).toBe(VersionChangeLevel.Patch);
  });

  test("returns Patch for an unchanged base", () => {
    expect.hasAssertions();

    expect(getVersionChangeLevel(current, current)).toBe(VersionChangeLevel.Patch);
  });
});
