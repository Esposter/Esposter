import { createRandomNumber } from "#shared/util/math/random/createRandomNumber";
import { describe, expect, test } from "vitest";

describe(createRandomNumber, () => {
  test("generates number within range", () => {
    expect.hasAssertions();

    for (let min = 0; min < 10; min++)
      for (let max = min + 1; max < 10; max++) {
        const number = createRandomNumber(max, min);

        expect(number).toBeGreaterThanOrEqual(min);
        expect(number).toBeLessThan(max);
      }
  });

  test("uses 0 as default min", () => {
    expect.hasAssertions();

    for (let max = 1; max < 10; max++) {
      const number = createRandomNumber(max);

      expect(number).toBeGreaterThanOrEqual(0);
      expect(number).toBeLessThan(max);
    }
  });
});
