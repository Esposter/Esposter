// Skewing a point onto the grid of triangles simplex noise sums over, and back
const SKEW = (Math.sqrt(3) - 1) / 2;
const UNSKEW = (3 - Math.sqrt(3)) / 6;
// Eight gradients around the circle, one picked for each corner of the grid by the shuffled table
const GRADIENTS_X = [1, -1, 1, -1, 1, -1, 0, 0];
const GRADIENTS_Y = [1, 1, -1, -1, 0, 0, 1, -1];
// Scales the sum of the three corners' contributions to about -1 to 1
const NOISE_SCALE = 70;
// Mulberry32: a seed to a stream of numbers from 0 up to 1, the same stream for the same seed
const createSeededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 2 ** 32;
  };
};
// One corner's share: a falloff of its distance, times its gradient's dot product with the offset to it
const getCornerContribution = (gradientIndex: number, offsetX: number, offsetY: number) => {
  const falloff = 0.5 - offsetX * offsetX - offsetY * offsetY;
  if (falloff < 0) return 0;
  const gradient = gradientIndex & 7;
  return falloff ** 4 * ((GRADIENTS_X[gradient] ?? 0) * offsetX + (GRADIENTS_Y[gradient] ?? 0) * offsetY);
};
// Two-dimensional simplex noise, Stefan Gustavson's formulation, over a table shuffled from a seed: a smooth value from
// About -1 to 1 at every point, the same at a point for the same seed. The table is doubled, so a corner's lookup
// Never wraps
export const createSimplexNoise = (seed: number) => {
  const random = createSeededRandom(seed);
  const table = Uint8Array.from({ length: 256 }, (_, index) => index);
  for (let index = table.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [table[index], table[swapIndex]] = [table[swapIndex] ?? 0, table[index] ?? 0];
  }
  const permutation = Uint8Array.from({ length: 512 }, (_, index) => table[index & 255] ?? 0);

  return (x: number, y: number) => {
    const skew = (x + y) * SKEW;
    const cellX = Math.floor(x + skew);
    const cellY = Math.floor(y + skew);
    const unskew = (cellX + cellY) * UNSKEW;
    const offsetX = x - cellX + unskew;
    const offsetY = y - cellY + unskew;
    // Which of the cell's two triangles the point is in decides the middle corner
    const middleX = offsetX > offsetY ? 1 : 0;
    const middleY = 1 - middleX;
    const tableX = cellX & 255;
    const tableY = cellY & 255;
    return (
      NOISE_SCALE *
      (getCornerContribution(permutation[tableX + (permutation[tableY] ?? 0)] ?? 0, offsetX, offsetY) +
        getCornerContribution(
          permutation[tableX + middleX + (permutation[tableY + middleY] ?? 0)] ?? 0,
          offsetX - middleX + UNSKEW,
          offsetY - middleY + UNSKEW,
        ) +
        getCornerContribution(
          permutation[tableX + 1 + (permutation[tableY + 1] ?? 0)] ?? 0,
          offsetX - 1 + 2 * UNSKEW,
          offsetY - 1 + 2 * UNSKEW,
        ))
    );
  };
};
