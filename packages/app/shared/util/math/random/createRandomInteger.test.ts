import { createRandomInteger } from "#shared/util/math/random/createRandomInteger";
import { describe, expect, test } from "vitest";

describe(createRandomInteger, () => {
  test("generates integer within range", () => {
    expect.hasAssertions();

    for (let min = 0; min < 10; min++)
      for (let max = min + 1; max < 10; max++) {
        const integer = createRandomInteger(max, min);

        expect(Number.isInteger(integer)).toBe(true);
        expect(integer).toBeGreaterThanOrEqual(min);
        expect(integer).toBeLessThan(max);
      }
  });
});
