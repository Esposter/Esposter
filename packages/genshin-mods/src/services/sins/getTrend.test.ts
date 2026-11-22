import { describe, expect, test } from "vitest";

import { SIN_HALF_LIFE_PROMPTS } from "./constants";
import { getPosteriorTrail } from "./getPosteriorTrail";
import { getTrend } from "./getTrend";

describe(getTrend, () => {
  test("keeps the last thirty scores, one per prompt", () => {
    expect.hasAssertions();

    const evidences = Array.from({ length: SIN_HALF_LIFE_PROMPTS + 10 }, () => 0.5);
    expect(getTrend(getPosteriorTrail(evidences))).toHaveLength(SIN_HALF_LIFE_PROMPTS);
  });
});
