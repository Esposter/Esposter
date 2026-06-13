import { getVersionChangeLevel } from "@/checkDependencies/getVersionChangeLevel";
import { describe, expect, test } from "vitest";

describe(getVersionChangeLevel, () => {
  const current = "0.0.0";

  test("returns 2 for a major change", () => {
    expect.hasAssertions();

    expect(getVersionChangeLevel(current, "1.0.0")).toBe(2);
  });

  test("returns 1 for a minor change", () => {
    expect.hasAssertions();

    expect(getVersionChangeLevel(current, "0.1.0")).toBe(1);
  });

  test("returns 0 for a patch change", () => {
    expect.hasAssertions();

    expect(getVersionChangeLevel(current, "0.0.1")).toBe(0);
  });

  test("returns 0 for an unchanged base", () => {
    expect.hasAssertions();

    expect(getVersionChangeLevel(current, current)).toBe(0);
  });
});
