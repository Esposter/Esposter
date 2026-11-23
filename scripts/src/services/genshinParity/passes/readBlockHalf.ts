import { SPLIT_BLOCK_PIXELS } from "#src/services/genshinParity/passes/constants";

// The half, 0 or 1, of the checkerboard of blocks a pixel falls in, so one family's pixels split into two halves to
// Measure
export const readBlockHalf = (pixel: number, width: number): number => {
  const blockX = Math.floor((pixel % width) / SPLIT_BLOCK_PIXELS);
  const blockY = Math.floor(Math.floor(pixel / width) / SPLIT_BLOCK_PIXELS);
  return (blockX + blockY) % 2;
};
