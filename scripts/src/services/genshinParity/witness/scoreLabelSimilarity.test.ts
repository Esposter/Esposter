import { scoreLabelSimilarity } from "#src/services/genshinParity/witness/scoreLabelSimilarity";
import { describe, expect, test } from "vitest";

describe(scoreLabelSimilarity, () => {
  const size = 64;
  const labels = new Int32Array(size * size);
  // Vertical stripes a period apart, shifted by the pixels given, as a tower's fluting would stand
  const drawStripes = (shift: number): Float32Array =>
    Float32Array.from({ length: size * size }, (_value, index) =>
      Math.floor(((index % size) + shift) / 4) % 2 ? 0.8 : 0.2,
    );

  test("scores an image against itself as identical, pixel by pixel at each scale", () => {
    expect.hasAssertions();

    const stripes = drawStripes(0);

    expect(scoreLabelSimilarity(stripes, stripes, size, size, labels, 1)).toStrictEqual({
      labelSimilarities: [{ scales: [1, 1, 1, 1, 1], similarity: 1 }],
      termMaps: [64, 32, 16, 8, 4].map((side) => ({
        height: side,
        terms: new Float32Array(side * side).fill(1),
        width: side,
      })),
    });
  });

  test("scores a label whose own pixels match as identical whatever its neighbour's differ by", () => {
    expect.hasAssertions();

    const stripes = drawStripes(0);
    const halves = Int32Array.from({ length: size * size }, (_value, index) => ((index % size) * 2 < size ? 0 : 1));
    const neighbourChanged = stripes.map((value, index) => (halves[index] === 1 ? 1 - value : value));
    const [{ similarity: own } = { similarity: 0 }, { similarity: neighbour } = { similarity: 0 }] =
      scoreLabelSimilarity(stripes, neighbourChanged, size, size, halves, 2).labelSimilarities;

    expect(own).toBeCloseTo(1);
    expect(neighbour).toBeLessThan(own);
  });

  test("scores detail a pixel off above no detail at all", () => {
    expect.hasAssertions();

    const stripes = drawStripes(0);
    const flat = new Float32Array(size * size).fill(0.5);
    const [{ similarity: shifted } = { similarity: 0 }] = scoreLabelSimilarity(
      stripes,
      drawStripes(1),
      size,
      size,
      labels,
      1,
    ).labelSimilarities;
    const [{ similarity: bare } = { similarity: 0 }] = scoreLabelSimilarity(
      stripes,
      flat,
      size,
      size,
      labels,
      1,
    ).labelSimilarities;

    expect(shifted).toBeGreaterThan(bare);
  });
});
