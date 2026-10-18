import { checkIsAmountReached } from "#src/services/checkIsAmountReached";
import { describe, expect, test } from "vitest";

describe(checkIsAmountReached, () => {
  test("reads a sum of float steps that should land on the target as reached, though it falls a residue short", () => {
    expect.hasAssertions();
    let sum = 0;
    for (let step = 0; step < 60; step++) sum += 6 * (1 / 60);

    expect(checkIsAmountReached(sum, 6)).toBe(true);
  });

  test("reads an amount short of the target by more than a residue as not reached", () => {
    expect.hasAssertions();

    expect(checkIsAmountReached(5.9, 6)).toBe(false);
  });
});
