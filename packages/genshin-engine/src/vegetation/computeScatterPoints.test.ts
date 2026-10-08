import { computeScatterPoints } from "#src/vegetation/computeScatterPoints";
import { describe, expect, test } from "vitest";

const SIZE = 2;
const SPACING = 0.5;
const CANDIDATE_COUNT = 64;
const SEED = 0;
// How far a float32 rounding may shorten a distance that the spacing already allows
const ROUNDING = 1e-5;

describe(computeScatterPoints, () => {
  test("grows the same plants for the same seed", () => {
    expect.hasAssertions();

    const options = { accepts: () => true, candidateCount: CANDIDATE_COUNT, seed: SEED, size: SIZE, spacing: SPACING };

    expect(computeScatterPoints(options)).toStrictEqual(computeScatterPoints(options));
  });

  test("keeps every two plants the spacing apart", () => {
    expect.hasAssertions();

    const points = computeScatterPoints({
      accepts: () => true,
      candidateCount: CANDIDATE_COUNT,
      seed: SEED,
      size: SIZE,
      spacing: SPACING,
    });
    const plantCount = points.length / 2;

    expect(plantCount).toBeGreaterThan(1);
    for (let first = 0; first < plantCount; first++)
      for (let second = first + 1; second < plantCount; second++) {
        const distance = Math.hypot(
          (points[second * 2] ?? 0) - (points[first * 2] ?? 0),
          (points[second * 2 + 1] ?? 0) - (points[first * 2 + 1] ?? 0),
        );
        expect(distance).toBeGreaterThanOrEqual(SPACING - ROUNDING);
      }
  });

  test("grows nothing where the ground refuses", () => {
    expect.hasAssertions();

    expect(
      computeScatterPoints({
        accepts: () => false,
        candidateCount: CANDIDATE_COUNT,
        seed: SEED,
        size: SIZE,
        spacing: SPACING,
      }),
    ).toStrictEqual(new Float32Array());
  });
});
