import { applySimilarityTransform } from "#src/services/genshinAssets/points/applySimilarityTransform";
import { matchSimilarity } from "#src/services/genshinAssets/points/matchSimilarity";
import { describe, expect, test } from "vitest";

describe(matchSimilarity, () => {
  test("finds the similarity through points the other set holds beside outliers it does not", () => {
    expect.hasAssertions();
    const transform = { mirrored: true, offset: { x: 500, z: 300 }, scale: 1, turn: 0 };
    // Points no other similarity than the true one carries onto their images, all the way round
    const from = [
      { x: 0, z: 0 },
      { x: 100, z: 0 },
      { x: 0, z: 100 },
      { x: 30, z: 70 },
      { x: 60, z: 20 },
      { x: 80, z: 40 },
      { x: 15, z: 55 },
      { x: 90, z: 95 },
      { x: 45, z: 5 },
      { x: 70, z: 85 },
    ];
    const to = [...from.map((point) => applySimilarityTransform(transform, point)), { x: 9000, z: 9000 }];
    const fit = matchSimilarity([...from, { x: 120, z: 30 }], to);
    expect(fit.pairs).toHaveLength(from.length);
    expect(fit.residual).toBeCloseTo(0);
    expect(fit.transform.mirrored).toBe(true);
    expect(fit.transform.scale).toBeCloseTo(1);
    expect(fit.transform.offset.x).toBeCloseTo(500);
    expect(fit.transform.offset.z).toBeCloseTo(300);
  });
});
