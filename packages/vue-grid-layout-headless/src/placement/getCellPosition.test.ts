import { getCellPosition } from "#src/placement/getCellPosition";
import { describe, expect, test } from "vitest";

describe(getCellPosition, () => {
  test("starts the nth cell n pitches past the padding that comes before the first", () => {
    expect.hasAssertions();

    expect(getCellPosition(2, 50, 10)).toBe(110);
  });
});
