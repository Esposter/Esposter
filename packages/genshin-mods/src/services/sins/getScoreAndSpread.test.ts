import { describe, expect, test } from "vitest";

import { getScoreAndSpread } from "./getScoreAndSpread";

describe(getScoreAndSpread, () => {
  test("reads the flat prior as an even half", () => {
    expect.hasAssertions();

    expect(getScoreAndSpread({ alpha: 1, beta: 1 }).score).toBe(0.5);
  });

  test("reads one prompt at level 0.8 from the flat prior as sixty percent", () => {
    expect.hasAssertions();

    expect(getScoreAndSpread({ alpha: 1.8, beta: 1.2 }).score).toBeCloseTo(0.6);
  });

  test("narrows its spread as the counts grow", () => {
    expect.hasAssertions();

    const few = getScoreAndSpread({ alpha: 2, beta: 2 }).spread;
    const many = getScoreAndSpread({ alpha: 40, beta: 40 }).spread;
    expect(many).toBeLessThan(few);
  });
});
