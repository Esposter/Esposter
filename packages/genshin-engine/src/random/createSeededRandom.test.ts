import { createSeededRandom } from "#src/random/createSeededRandom";
import { describe, expect, test } from "vitest";

describe(createSeededRandom, () => {
  const seed = 0;
  const length = 2;

  test("repeats its stream for the same seed", () => {
    expect.hasAssertions();

    const random = createSeededRandom(seed);
    const repeatedRandom = createSeededRandom(seed);

    expect(Array.from({ length }, () => random())).toStrictEqual(Array.from({ length }, () => repeatedRandom()));
  });

  test("draws a different stream for another seed", () => {
    expect.hasAssertions();

    const random = createSeededRandom(seed);
    const otherRandom = createSeededRandom(seed + 1);

    expect(random()).not.toBe(otherRandom());
  });
});
