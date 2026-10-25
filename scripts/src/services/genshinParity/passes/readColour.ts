import type { Vector } from "#src/models/shared/Vector";

export const readColour = (colour: Float32Array, pixel: number): Vector => [
  colour[pixel * 4] ?? 0,
  colour[pixel * 4 + 1] ?? 0,
  colour[pixel * 4 + 2] ?? 0,
];
