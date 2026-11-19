import { describe, expect, test } from "vitest";

import { SIN_HALF_LIFE_PROMPTS } from "./constants";
import { getPosterior, getPosteriorTrail } from "./getPosteriorTrail";

describe(getPosteriorTrail, () => {
  const evidences = [0.9, 0.1, 0.5];

  test("keeps one posterior per prompt", () => {
    expect.hasAssertions();

    expect(getPosteriorTrail(evidences)).toHaveLength(evidences.length);
  });

  test("moves about halfway to a new level within one half-life", () => {
    expect.hasAssertions();

    const steady = Array.from({ length: 300 }, () => 0.9);
    const switched = Array.from({ length: SIN_HALF_LIFE_PROMPTS }, () => 0.1);
    const { alpha, beta } = getPosterior(getPosteriorTrail([...steady, ...switched]));
    expect(alpha / (alpha + beta)).toBeCloseTo(0.5, 1);
  });
});

describe(getPosterior, () => {
  test("reads a sin with no evidence as the flat prior", () => {
    expect.hasAssertions();

    expect(getPosterior([])).toStrictEqual({ alpha: 1, beta: 1 });
  });
});
