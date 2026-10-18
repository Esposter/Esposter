import { computeDomainWaveAfterDefeat } from "#src/services/domains/computeDomainWaveAfterDefeat";
import { describe, expect, test } from "vitest";

describe(computeDomainWaveAfterDefeat, () => {
  const WAVES = [[{ count: 2, name: "Pyro Slime" }], [{ count: 1, name: "Large Pyro Slime" }]];

  test("the next wave spawns when the last enemy of the current one falls", () => {
    expect.hasAssertions();

    expect(computeDomainWaveAfterDefeat(WAVES, 0, 1)).toBe(0);
    expect(computeDomainWaveAfterDefeat(WAVES, 0, 2)).toBe(1);
  });

  test("the last wave holds the challenge to its end", () => {
    expect.hasAssertions();

    expect(computeDomainWaveAfterDefeat(WAVES, 1, 1)).toBe(1);
  });
});
