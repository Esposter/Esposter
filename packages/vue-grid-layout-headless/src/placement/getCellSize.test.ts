import { getCellSize } from "#src/placement/getCellSize";
import { describe, expect, test } from "vitest";

describe(getCellSize, () => {
  test("spans a pitch per cell, less the gap after the last cell", () => {
    expect.hasAssertions();

    expect(getCellSize(2, 50, 10)).toBe(90);
  });
});
