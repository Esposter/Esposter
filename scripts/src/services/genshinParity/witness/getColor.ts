import { toByte } from "#src/services/shared/toByte";

// A pixel's first three floats of a target as a colour, each through the given map to a share of full brightness
export const getColor = (
  values: Float32Array,
  pixel: number,
  toShare: (value: number) => number,
): [number, number, number] => [
  toByte(toShare(values[pixel * 4] ?? 0)),
  toByte(toShare(values[pixel * 4 + 1] ?? 0)),
  toByte(toShare(values[pixel * 4 + 2] ?? 0)),
];
