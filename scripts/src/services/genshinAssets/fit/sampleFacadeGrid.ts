import type { FacadeGrid } from "#src/models/genshinAssets/fit/FacadeGrid";

// A facade grid read again on cells the given number of times as wide, each the cell of the fine grid at its middle, a
// Partial cell at the far edge read at the fine grid's last so the seam and the crown keep their paint
export const sampleFacadeGrid = (grid: FacadeGrid, factor: number): FacadeGrid => {
  const width = Math.ceil(grid.width / factor);
  const height = Math.ceil(grid.height / factor);
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
      const fineRow = Math.min(row * factor + middle, grid.height - 1);
      const fineColumn = Math.min(column * factor + middle, grid.width - 1);
      const cell = fineRow * grid.width + fineColumn;
      sampled.colors.push(grid.colors[cell] ?? [0, 0, 0]);
      sampled.depths.push(grid.depths[cell] ?? 0);
      sampled.metals.push(grid.metals[cell] ?? 0);
      sampled.tags.push(grid.tags[cell] ?? -1);
    }
  return sampled;
};
