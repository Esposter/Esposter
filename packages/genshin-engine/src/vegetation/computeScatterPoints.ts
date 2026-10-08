import type { ScatterOptions } from "#src/models/vegetation/ScatterOptions";

import { createSeededRandom } from "#src/random/createSeededRandom";

// The grid's cells are a spacing over the square root of two a side, so one cell holds at most one kept plant, and a
// Candidate need check only the cells within a spacing of it
const CELL_SIZE_PER_SPACING = 1 / Math.SQRT2;
// How many cells a spacing reaches across a cell, rounded up
const CELL_REACH = Math.ceil(Math.SQRT2);

// Whether a kept plant stands closer than the spacing to a point, looking only at the cells that could hold one
const isCrowded = (
  cells: Int32Array,
  cellsPerSide: number,
  points: number[],
  spacing: number,
  column: number,
  row: number,
  x: number,
  z: number,
): boolean => {
  for (
    let neighbourRow = Math.max(0, row - CELL_REACH);
    neighbourRow <= Math.min(cellsPerSide - 1, row + CELL_REACH);
    neighbourRow++
  )
    for (
      let neighbourColumn = Math.max(0, column - CELL_REACH);
      neighbourColumn <= Math.min(cellsPerSide - 1, column + CELL_REACH);
      neighbourColumn++
    ) {
      const pointIndex = cells[neighbourRow * cellsPerSide + neighbourColumn] ?? -1;
      if (pointIndex === -1) continue;
      const distanceX = (points[pointIndex * 2] ?? 0) - x;
      const distanceZ = (points[pointIndex * 2 + 1] ?? 0) - z;
      if (distanceX * distanceX + distanceZ * distanceZ < spacing * spacing) return true;
    }
  return false;
};

// Plants scattered over a square by dart throwing: each candidate in a seeded stream is kept when the ground accepts
// It and no kept plant stands closer than the spacing, so the plants are spaced evenly yet without a visible grid. The
// Same options give the same plants, returned as x and z pairs relative to the square's corner
export const computeScatterPoints = ({
  accepts,
  candidateCount,
  seed,
  size,
  spacing,
}: ScatterOptions): Float32Array => {
  const random = createSeededRandom(seed);
  const cellSize = spacing * CELL_SIZE_PER_SPACING;
  const cellsPerSide = Math.ceil(size / cellSize);
  const cells = new Int32Array(cellsPerSide * cellsPerSide).fill(-1);
  const points: number[] = [];
  for (let candidate = 0; candidate < candidateCount; candidate++) {
    const x = random() * size;
    const z = random() * size;
    const column = Math.floor(x / cellSize);
    const row = Math.floor(z / cellSize);
    if (!accepts(x, z) || isCrowded(cells, cellsPerSide, points, spacing, column, row, x, z)) continue;
    cells[row * cellsPerSide + column] = points.length / 2;
    points.push(x, z);
  }
  return Float32Array.from(points);
};
