import { getCellPosition } from "@/services/dashboard/grid/getCellPosition";
import { describe, expect, test } from "vitest";

describe(getCellPosition, () => {
  test("starts the nth cell n pitches past the margin that comes before the first", () => {
    expect.hasAssertions();

    expect(getCellPosition(2, 50)).toBe(110);
  });
});
