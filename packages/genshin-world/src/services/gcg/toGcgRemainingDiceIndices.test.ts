import { describe, expect, test } from "vitest";

import { toGcgRemainingDiceIndices } from "#src/services/gcg/toGcgRemainingDiceIndices";

describe("toGcgRemainingDiceIndices", () => {
  test("should number each group's dice among the dice left once the payment is taken", () => {
    expect.hasAssertions();

    expect(toGcgRemainingDiceIndices([[0, 3], [4]], [1, 2])).toStrictEqual([[0, 1], [2]]);
  });

  test("should keep each group as it is when nothing is paid", () => {
    expect.hasAssertions();

    expect(toGcgRemainingDiceIndices([[0, 2]], [])).toStrictEqual([[0, 2]]);
  });
});
