import { checkIsAmountReached } from "#src/services/checkIsAmountReached";
import { describe, expect, test } from "vitest";

describe(checkIsAmountReached, () => {
  const TARGET = 6;

  test("reads a sum of float steps that should land on the target as reached, though it falls a residue short", () => {
    expect.hasAssertions();
    let sum = 0;
    for (let step = 0; step < 60; step++) sum += TARGET * (1 / 60);

    expect(checkIsAmountReached(sum, TARGET)).toBe(true);
  });

  test("reads an amount short of the target by more than a residue as not reached", () => {
    expect.hasAssertions();

    expect(checkIsAmountReached(5.9, TARGET)).toBe(false);
  });
});
