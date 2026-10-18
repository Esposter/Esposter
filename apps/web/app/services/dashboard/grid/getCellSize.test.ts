import { getCellSize } from "@/services/dashboard/grid/getCellSize";
import { describe, expect, test } from "vitest";

describe(getCellSize, () => {
  test("spans a pitch per cell, less the margin after the last cell", () => {
    expect.hasAssertions();

    expect(getCellSize(2, 50)).toBe(90);
  });
});
