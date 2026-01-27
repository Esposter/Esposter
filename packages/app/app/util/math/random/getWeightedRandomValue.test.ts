import { getWeightedRandomValue } from "@/util/math/random/getWeightedRandomValues";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getWeightedRandomValue, () => {
  test("gets", () => {
    expect.hasAssertions();

    expect(getWeightedRandomValue([{ cumulativeWeight: 0 }])).toStrictEqual({ cumulativeWeight: 0 });
  });

  test("fails for empty array", () => {
    expect.hasAssertions();

    expect(() => getWeightedRandomValue([])).toThrowError(
      new InvalidOperationError(
        Operation.Read,
        getWeightedRandomValue.name,
        "cannot pick weighted random value from empty values",
      ),
    );
  });
});
