import { getWeightedRandomValue } from "@/util/math/random/getWeightedRandomValue";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(getWeightedRandomValue, () => {
  // Three bands of deliberately unequal width, so an off-by-one lands on a different value rather than
  // Coincidentally on the right one
  const values = [{ cumulativeWeight: 10 }, { cumulativeWeight: 30 }, { cumulativeWeight: 60 }];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("gets", () => {
    expect.hasAssertions();

    expect(getWeightedRandomValue([{ cumulativeWeight: 0 }])).toStrictEqual({ cumulativeWeight: 0 });
  });

  // A cumulative weight is its band's upper bound, and the random value is that top weight scaled by
  // `Math.random`. The top band is the one an off-by-one makes unreachable, so it is the case worth pinning
  test.each([
    [0, 10],
    [0.25, 30],
    [0.9, 60],
    [0.999, 60],
  ])("picks the band holding %d of the total weight", (randomFraction, expectedCumulativeWeight) => {
    expect.hasAssertions();

    vi.spyOn(Math, "random").mockReturnValue(randomFraction);

    expect(getWeightedRandomValue(values)).toStrictEqual({ cumulativeWeight: expectedCumulativeWeight });
  });

  test("fails for empty array", () => {
    expect.hasAssertions();

    expect(() => getWeightedRandomValue([])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, getWeightedRandomValue.name, "cannot pick weighted random value from empty values").message}]`,
    );
  });
});
