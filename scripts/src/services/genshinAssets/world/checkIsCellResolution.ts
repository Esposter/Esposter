// The fewest cells a side a tile's cell map takes, and every side is a power of two
const MIN_CELL_RESOLUTION = 64;

export const checkIsCellResolution = (resolution: number): boolean =>
  Number.isInteger(resolution) && resolution >= MIN_CELL_RESOLUTION && (resolution & (resolution - 1)) === 0;
