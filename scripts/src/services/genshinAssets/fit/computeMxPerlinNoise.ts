// The engine's `mx_noise_float` on a point, as three's MaterialX Perlin lattice computes it: a hashed gradient at each
// Corner of the unit cell, the gradients trilinearly blended by faded fractions, and scaled to fill about one. A plain
// Port of three's `mx_perlin_noise_float_1` and the functions it calls, so a fit can measure the noise the render draws
const SCALE = 0.982;
const HASH_SEED = 0xdeadbeef + 3 * 4 + 13;

const rotateLeft = (value: number, bits: number): number => ((value << bits) | (value >>> (32 - bits))) >>> 0;

// Bob Jenkins' final mix over three uint32 words, returning the last one
const mixFinal = (wordA: number, wordB: number, wordC: number): number => {
  let [a, b, c] = [wordA >>> 0, wordB >>> 0, wordC >>> 0];
  c = (c ^ b) >>> 0;
  c = (c - rotateLeft(b, 14)) >>> 0;
  a = (a ^ c) >>> 0;
  a = (a - rotateLeft(c, 11)) >>> 0;
  b = (b ^ a) >>> 0;
  b = (b - rotateLeft(a, 25)) >>> 0;
  c = (c ^ b) >>> 0;
  c = (c - rotateLeft(b, 16)) >>> 0;
  a = (a ^ c) >>> 0;
  a = (a - rotateLeft(c, 4)) >>> 0;
  b = (b ^ a) >>> 0;
  b = (b - rotateLeft(a, 14)) >>> 0;
  c = (c ^ b) >>> 0;
  return (c - rotateLeft(b, 24)) >>> 0;
};

const hashLatticePoint = (x: number, y: number, z: number): number =>
  mixFinal((HASH_SEED + x) >>> 0, (HASH_SEED + y) >>> 0, (HASH_SEED + z) >>> 0);

// A lattice corner's gradient dotted with its offset, the sign and axis chosen by the hash's low bits
const computeGradient = (hash: number, x: number, y: number, z: number): number => {
  const bits = hash & 15;
  const u = bits < 8 ? x : y;
  const v = bits < 4 ? y : bits === 12 || bits === 14 ? x : z;
  return (bits & 1 ? -u : u) + (bits & 2 ? -v : v);
};

const fade = (fraction: number): number => fraction * fraction * fraction * (fraction * (fraction * 6 - 15) + 10);

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
