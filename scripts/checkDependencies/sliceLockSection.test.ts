import { sliceLockSection } from "@/checkDependencies/sliceLockSection";
import { describe, expect, test } from "vitest";

describe(sliceLockSection, () => {
  test("slices from the start marker up to the nearest end marker", () => {
    expect.hasAssertions();

    expect(sliceLockSection("\ncatalogs:\na\npackages:\nb", "\ncatalogs:", ["\npackages:"])).toBe("\ncatalogs:\na");
  });

  test("returns an empty string when the start marker is missing", () => {
    expect.hasAssertions();

    expect(sliceLockSection("", "\ncatalogs:", ["\npackages:"])).toBe("");
  });
});
