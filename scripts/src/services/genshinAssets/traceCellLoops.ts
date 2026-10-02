import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import { traceCoveredGrid } from "#src/services/genshinAssets/traceCoveredGrid";

// The loops round a set of a grid's cells, traced over the cells' own bounds and kept where they enclose at least
// `minCells`, in the grid's metres from its corner
export const traceCellLoops = (
  cells: readonly number[],
  {
    cellSize,
    corner: [cornerX, cornerY],
    minCells,
    tolerance,
    width,
  }: { cellSize: number; corner: readonly [number, number]; minCells: number; tolerance: number; width: number },
): [number, number][][] => {
  if (cells.length === 0) return [];
  const columns = cells.map((cell) => cell % width);
  const rows = cells.map((cell) => Math.floor(cell / width));
  // Reduced rather than spread, since a surface's cells run past the arguments a call can take
  const readBound = (values: readonly number[], pick: (first: number, second: number) => number): number =>
    values.reduce((bound, value) => pick(bound, value));
  const [firstColumn, firstRow] = [readBound(columns, Math.min), readBound(rows, Math.min)];
  const boundsWidth = readBound(columns, Math.max) - firstColumn + 1;
  const boundsHeight = readBound(rows, Math.max) - firstRow + 1;
  const covered = new Uint8Array(boundsWidth * boundsHeight);
  for (const [index, column] of columns.entries())
    covered[((rows[index] ?? 0) - firstRow) * boundsWidth + column - firstColumn] = 1;
  return traceCoveredGrid(covered, { height: boundsHeight, tolerance, width: boundsWidth })
    .filter(
      (loop) =>
        Math.abs(
          loop.reduce((sum, [x, y], index) => {
            const [nextX, nextY] = loop[(index + 1) % loop.length] ?? [x, y];
            return sum + x * nextY - nextX * y;
          }, 0),
        ) /
          2 >=
        minCells,
    )
    .map((loop) =>
      loop.map(([column, row]): [number, number] => [
        roundFitted(cornerX + (firstColumn + column) * cellSize),
        roundFitted(cornerY + (firstRow + row) * cellSize),
      ]),
    );
};
