import { computeGradient } from "#src/services/genshinAssets/fit/computeGradient";
import { fade } from "#src/services/genshinAssets/fit/fade";
import { hashLatticePoint } from "#src/services/genshinAssets/fit/hashLatticePoint";

// The engine's `mx_noise_float` on a point, as three's MaterialX Perlin lattice computes it: a hashed gradient at each
// Corner of the unit cell, the gradients trilinearly blended by faded fractions, and scaled to fill about one. A plain
// Port of three's `mx_perlin_noise_float_1` and the functions it calls, so a fit can measure the noise the render draws
const SCALE = 0.982;

export const computeMxPerlinNoise = (x: number, y: number, z: number): number => {
  const [cellX, cellY, cellZ] = [Math.floor(x), Math.floor(y), Math.floor(z)];
  const [fractionX, fractionY, fractionZ] = [x - cellX, y - cellY, z - cellZ];
  const corner = (offsetX: number, offsetY: number, offsetZ: number): number =>
    computeGradient(
      hashLatticePoint(cellX + offsetX, cellY + offsetY, cellZ + offsetZ),
      fractionX - offsetX,
      fractionY - offsetY,
      fractionZ - offsetZ,
    );
  const [u, v, w] = [fade(fractionX), fade(fractionY), fade(fractionZ)];
  const lowerY =
    (1 - v) * ((1 - u) * corner(0, 0, 0) + u * corner(1, 0, 0)) + v * ((1 - u) * corner(0, 1, 0) + u * corner(1, 1, 0));
  const upperY =
    (1 - v) * ((1 - u) * corner(0, 0, 1) + u * corner(1, 0, 1)) + v * ((1 - u) * corner(0, 1, 1) + u * corner(1, 1, 1));
  return SCALE * ((1 - w) * lowerY + w * upperY);
};
