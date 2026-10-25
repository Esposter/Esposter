// The fewest samples a side a tile's heightfield takes, and every side is a power of two and one
const MIN_RESOLUTION = 33;

export const checkIsResolution = (resolution: number): boolean =>
  Number.isInteger(resolution) && resolution >= MIN_RESOLUTION && ((resolution - 1) & (resolution - 2)) === 0;
