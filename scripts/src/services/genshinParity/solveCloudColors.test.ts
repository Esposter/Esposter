import { solveCloudColors } from "#src/services/genshinParity/solveCloudColors";
import { describe, expect, test } from "vitest";

describe(solveCloudColors, () => {
  type Vector = [number, number, number];

  test("recovers the clouds' colours from clouds standing elsewhere in the reference", () => {
    expect.hasAssertions();

    const shade: Vector = [0.4, 0.2, 0.3];
    const lit: Vector = [1, 0.8, 0.6];
    // Each of ours lit by its crown's share, opaque over a sky that weighs nothing; the reference's the same shares
    // Drawn in the true colours, in another order
    const shares = Array.from({ length: 400 }, (_, index) => (index % 100) / 99);
    const ours = shares.map((share) => ({
      base: [0, 0, 0] as Vector,
      lit: [share, share, share] as Vector,
      shade: [1 - share, 1 - share, 1 - share] as Vector,
    }));
    const reference = shares
      .toReversed()
      .map(
        (share) =>
          [0, 1, 2].map((channel) => (shade[channel] ?? 0) * (1 - share) + (lit[channel] ?? 0) * share) as Vector,
      );
    const solved = solveCloudColors(ours, reference);

    expect(solved.shade.map((value) => Number(value.toFixed(3)))).toStrictEqual(shade);
    expect(solved.lit.map((value) => Number(value.toFixed(3)))).toStrictEqual(lit);
  });
});
