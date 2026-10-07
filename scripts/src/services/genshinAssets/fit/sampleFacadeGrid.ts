import type { FacadeGrid } from "#src/models/genshinAssets/fit/FacadeGrid";

// A facade grid read again on cells the given number of times as wide, each the cell of the fine grid at its middle
export const sampleFacadeGrid = (grid: FacadeGrid, factor: number): FacadeGrid => {
  const width = Math.floor(grid.width / factor);
  const height = Math.floor(grid.height / factor);
  const sampled: FacadeGrid = {
    cellSize: grid.cellSize * factor,
    colors: [],
    depths: [],
    height,
    metals: [],
    tags: [],
    width,
  };
  const middle = Math.floor(factor / 2);
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++) {
      const cell = (row * factor + middle) * grid.width + column * factor + middle;
      sampled.colors.push(grid.colors[cell] ?? [0, 0, 0]);
      sampled.depths.push(grid.depths[cell] ?? 0);
      sampled.metals.push(grid.metals[cell] ?? 0);
      sampled.tags.push(grid.tags[cell] ?? -1);
    }
  return sampled;
};
