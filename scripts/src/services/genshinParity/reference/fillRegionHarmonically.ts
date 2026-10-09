import type { ParityRegion } from "#src/models/genshinParity/shared/ParityRegion";

const CHANNELS = 4;
const COLOUR_CHANNELS = 3;
// A level whose longer side is at most this is solved outright, since a finer one only ever starts from its solution
const COARSEST_SIDE = 8;
const RELAX_SWEEP_LIMIT = 2000;
// A sweep whose largest change is under this, on the 0 to 255 scale, has settled the level
const SETTLED_CHANGE = 0.01;

interface Level {
  height: number;
  known: Uint8Array;
  values: Float64Array;
  width: number;
}

// The level's pixels just outside the region are its boundary, known from the frame, and the region's own are unknown.
// Built over the region and its one-pixel ring, clipped to the frame, so a region on a frame edge has no ring there
const getFinestLevel = (pixels: Uint8Array, width: number, height: number, region: ParityRegion): Level => {
  const left = Math.max(0, region.x - 1);
  const top = Math.max(0, region.y - 1);
  const levelWidth = Math.min(width, region.x + region.width + 1) - left;
  const levelHeight = Math.min(height, region.y + region.height + 1) - top;
  const known = new Uint8Array(levelWidth * levelHeight);
  const values = new Float64Array(levelWidth * levelHeight * COLOUR_CHANNELS);
  for (let row = 0; row < levelHeight; row++)
    for (let column = 0; column < levelWidth; column++) {
      const frameX = left + column;
      const frameY = top + row;
      const index = row * levelWidth + column;
      const isInside =
        frameX >= region.x &&
        frameX < region.x + region.width &&
        frameY >= region.y &&
        frameY < region.y + region.height;
      known[index] = Number(!isInside);
      const pixelIndex = (frameY * width + frameX) * CHANNELS;
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
        values[index * COLOUR_CHANNELS + channel] = pixels[pixelIndex + channel] ?? 0;
    }
  return { height: levelHeight, known, values, width: levelWidth };
};

// A coarse cell is known where any of its children is, its colour the mean of those children that are known, so the
// Coarse level's boundary is the frame's ring averaged over each block, and its unknown cells the region's interior
const getCoarserLevel = ({ height, known, values, width }: Level): Level => {
  const coarseWidth = Math.ceil(width / 2);
  const coarseHeight = Math.ceil(height / 2);
  const coarseKnown = new Uint8Array(coarseWidth * coarseHeight);
  const coarseValues = new Float64Array(coarseWidth * coarseHeight * COLOUR_CHANNELS);
  for (let row = 0; row < coarseHeight; row++)
    for (let column = 0; column < coarseWidth; column++) {
      const index = row * coarseWidth + column;
      let knownCount = 0;
      const sums = [0, 0, 0];
      for (let childRow = row * 2; childRow < Math.min(height, row * 2 + 2); childRow++)
        for (let childColumn = column * 2; childColumn < Math.min(width, column * 2 + 2); childColumn++) {
          const childIndex = childRow * width + childColumn;
          if (!known[childIndex]) continue;
          knownCount++;
          for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
            sums[channel] = (sums[channel] ?? 0) + (values[childIndex * COLOUR_CHANNELS + channel] ?? 0);
        }
      coarseKnown[index] = Number(knownCount > 0);
      if (knownCount === 0) continue;
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
        coarseValues[index * COLOUR_CHANNELS + channel] = (sums[channel] ?? 0) / knownCount;
    }
  return { height: coarseHeight, known: coarseKnown, values: coarseValues, width: coarseWidth };
};

// Each unknown cell takes its coarse parent's solved colour as its start, so the relaxation below only smooths
const prolongInto = (coarse: Level, fine: Level): void => {
  for (let row = 0; row < fine.height; row++)
    for (let column = 0; column < fine.width; column++) {
      const index = row * fine.width + column;
      if (fine.known[index]) continue;
      const coarseIndex = (row >> 1) * coarse.width + (column >> 1);
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
        fine.values[index * COLOUR_CHANNELS + channel] = coarse.values[coarseIndex * COLOUR_CHANNELS + channel] ?? 0;
    }
};

// The colours of a cell's neighbours inside the level are added to the sums, and their count returned
const sumNeighbours = (
  values: Float64Array,
  width: number,
  height: number,
  index: number,
  sums: Float64Array,
): number => {
  const column = index % width;
  const row = Math.floor(index / width);
  const neighbourIndexes = [
    column > 0 ? index - 1 : -1,
    column < width - 1 ? index + 1 : -1,
    row > 0 ? index - width : -1,
    row < height - 1 ? index + width : -1,
  ];
  let neighbourCount = 0;
  for (const neighbourIndex of neighbourIndexes) {
    if (neighbourIndex === -1) continue;
    neighbourCount++;
    for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
      sums[channel] = (sums[channel] ?? 0) + (values[neighbourIndex * COLOUR_CHANNELS + channel] ?? 0);
  }
  return neighbourCount;
};

// Gauss-Seidel sweeps: each unknown cell becomes the mean of its neighbours inside the level, so the solution is
// Harmonic, Laplace's equation with the boundary's values, and a level's neighbours outside it are simply not counted
const relax = ({ height, known, values, width }: Level): void => {
  const sums = new Float64Array(COLOUR_CHANNELS);
  for (let sweep = 0; sweep < RELAX_SWEEP_LIMIT; sweep++) {
    let largestChange = 0;
    for (let index = 0; index < known.length; index++) {
      if (known[index]) continue;
      sums.fill(0);
      const neighbourCount = sumNeighbours(values, width, height, index, sums);
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++) {
        const valueIndex = index * COLOUR_CHANNELS + channel;
        const solved = (sums[channel] ?? 0) / neighbourCount;
        largestChange = Math.max(largestChange, Math.abs(solved - (values[valueIndex] ?? 0)));
        values[valueIndex] = solved;
      }
    }
    if (largestChange < SETTLED_CHANGE) return;
  }
};

// Multigrid in its coarse-to-fine form: the coarser level is solved first, its solution carried down as the start, and
// Each level relaxed on top, so the low frequencies are already right where the finest level's relaxation begins
const solveLevel = (level: Level): void => {
  if (Math.max(level.width, level.height) > COARSEST_SIDE) {
    const coarse = getCoarserLevel(level);
    solveLevel(coarse);
    prolongInto(coarse, level);
  }
  relax(level);
};

// The region's pixels replaced by the harmonic fill of their surroundings, per colour channel: the solution of
// Laplace's equation inside the region, with the pixels just outside it as its boundary. A linear gradient around the
// Region is therefore the gradient inside it, and a flat border fills flat. Alpha and every pixel outside the region are
// Kept as they are. The region must have a pixel outside it to fill from, which the caller checks
export const fillRegionHarmonically = (
  pixels: Uint8Array,
  width: number,
  height: number,
  region: ParityRegion,
): Uint8Array => {
  const filled = Uint8Array.from(pixels);
  const finest = getFinestLevel(pixels, width, height, region);
  solveLevel(finest);
  const left = Math.max(0, region.x - 1);
  const top = Math.max(0, region.y - 1);
  for (let row = 0; row < finest.height; row++)
    for (let column = 0; column < finest.width; column++) {
      const index = row * finest.width + column;
      if (finest.known[index]) continue;
      const pixelIndex = ((top + row) * width + left + column) * CHANNELS;
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
        filled[pixelIndex + channel] = Math.min(
          255,
          Math.max(0, Math.round(finest.values[index * COLOUR_CHANNELS + channel] ?? 0)),
        );
    }
  return filled;
};
