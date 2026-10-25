import type { Vector } from "#src/models/shared/Vector";

export const xyzToLinear = ([x, y, z]: Vector): Vector => [
  3.241003275 * x - 1.537398934 * y - 0.498615861 * z,
  -0.969224334 * x + 1.875930071 * y + 0.041554224 * z,
  0.055639423 * x - 0.204011202 * y + 1.057148933 * z,
];
