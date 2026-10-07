// The family a part target draws at a pixel, or none (-1) where no part stands
export const readTargetFamily = (part: Float32Array, pixel: number): number =>
  (part[pixel * 4] ?? 0) > 0 ? (part[pixel * 4 + 1] ?? -1) : -1;
