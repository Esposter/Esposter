import { getBatches } from "#src/services/shared/getBatches";
import { describe, expect, test } from "vitest";

describe(getBatches, () => {
  test("holds whole items to the limit, and an item heavier than it alone", () => {
    expect.hasAssertions();

    expect(getBatches([2, 2, 3, 1, 5], (weight) => weight, 4)).toStrictEqual([[5], [3, 1], [2, 2]]);
  });
});
