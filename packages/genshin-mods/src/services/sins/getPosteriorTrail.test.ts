import { describe, expect, test } from "vitest";

import { SIN_HALF_LIFE_PROMPTS } from "./constants";
import { getPosterior, getPosteriorTrail } from "./getPosteriorTrail";

describe(getPosteriorTrail, () => {
  const evidences = [0.9, 0.1, 0.5];

  test("replays the evidence one prompt at a time", () => {
    expect.hasAssertions();

    const trail = getPosteriorTrail(evidences);
    expect(trail).toHaveLength(evidences.length);
    expect(getPosterior(evidences)).toStrictEqual(trail.at(-1));
  });

  test("moves about halfway to a new level within one half-life", () => {
    expect.hasAssertions();

    const steady = Array.from({ length: 300 }, () => 0.9);
    const switched = Array.from({ length: SIN_HALF_LIFE_PROMPTS }, () => 0.1);
    const { alpha, beta } = getPosterior([...steady, ...switched]);
    expect(alpha / (alpha + beta)).toBeCloseTo(0.5, 1);
  });
});

describe(getPosterior, () => {
  test("reads a sin with no evidence as the flat prior", () => {
    expect.hasAssertions();

    expect(getPosterior([])).toStrictEqual({ alpha: 1, beta: 1 });
  });
});
