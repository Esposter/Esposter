import { drawWeightedValue } from "#src/services/shared/drawWeightedValue";
import { describe, expect, test } from "vitest";

describe(drawWeightedValue, () => {
  const FIRST = "first";
  const SECOND = "second";
  const weightedValues = [
    { value: FIRST, weight: 1 },
    { value: SECOND, weight: 3 },
  ];

  test("draws each value in proportion to its weight", () => {
    expect.hasAssertions();

    expect(drawWeightedValue(weightedValues, () => 0)).toBe(FIRST);
    expect(drawWeightedValue(weightedValues, () => 0.25)).toBe(SECOND);
    expect(drawWeightedValue(weightedValues, () => 0.99)).toBe(SECOND);
  });

  test("never draws a value with no weight", () => {
    expect.hasAssertions();

    expect(drawWeightedValue([{ value: "unweighted", weight: 0 }, ...weightedValues], () => 0)).toBe(FIRST);
  });
});
