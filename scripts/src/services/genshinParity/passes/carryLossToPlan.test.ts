import { carryLossToPlan } from "#src/services/genshinParity/passes/carryLossToPlan";
import { describe, expect, test } from "vitest";

describe(carryLossToPlan, () => {
  test("sums each of the family's pixels' loss into the plan's cell its place wraps into", () => {
    expect.hasAssertions();

    // Two pixels of family 0, the second a whole plan along its first axis from the first, and one of family 1
    const part = Float32Array.from([1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1]);
    const position = Float32Array.from([0.25, 0, 0.75, 1, 1.25, 0, 0.75, 1, 0.25, 0, 0.25, 1]);
    const termMaps = [{ height: 1, terms: Float32Array.from([0.5, 0.75, 0]), width: 3 }];

    const { counts, losses } = carryLossToPlan(
      termMaps,
      { part, position },
      { axes: [0, 2], corner: [0, 0], family: 0, pixelsPerMetre: 2, size: [1, 1], width: 3 },
    );

    expect([...losses]).toStrictEqual([0, 0, 0.75, 0]);
    expect([...counts]).toStrictEqual([0, 0, 2, 0]);
  });
});
