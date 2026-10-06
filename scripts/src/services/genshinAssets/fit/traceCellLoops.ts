import { computeLoopArea } from "#src/services/genshinAssets/fit/computeLoopArea";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { traceCoveredGrid } from "#src/services/genshinAssets/fit/traceCoveredGrid";
import { FITTED_DECIMALS } from "#src/services/genshinAssets/shared/constants";

// The least and greatest of many values, reduced rather than spread, since a surface's cells run past the arguments a
// Call can take
const computeLeast = (values: readonly number[]): number => values.reduce((least, value) => Math.min(least, value));
const computeGreatest = (values: readonly number[]): number =>
  values.reduce((greatest, value) => Math.max(greatest, value));
// The loops round a set of a grid's cells, traced over the cells' own bounds and kept where they enclose at least
// `minCells`, in the grid's metres from its corner, kept to the centimetre or to as many decimals as asked
export const traceCellLoops = (
  cells: readonly number[],
  {
    cellSize,
    corner: [cornerX, cornerY],
    decimals = FITTED_DECIMALS,
    minCells,
    tolerance,
    width,
  }: {
    cellSize: number;
    corner: readonly [number, number];
    decimals?: number;
    minCells: number;
    tolerance: number;
    width: number;
  },
): [number, number][][] => {
  if (cells.length === 0) return [];
  const columns = cells.map((cell) => cell % width);
  const rows = cells.map((cell) => Math.floor(cell / width));
  const [firstColumn, firstRow] = [computeLeast(columns), computeLeast(rows)];
  const boundsWidth = computeGreatest(columns) - firstColumn + 1;
  const boundsHeight = computeGreatest(rows) - firstRow + 1;
  const covered = new Uint8Array(boundsWidth * boundsHeight);
  for (const [index, column] of columns.entries())
    covered[((rows[index] ?? 0) - firstRow) * boundsWidth + column - firstColumn] = 1;
  return traceCoveredGrid(covered, { height: boundsHeight, tolerance, width: boundsWidth })
    .filter((loop) => computeLoopArea(loop) >= minCells)
    .map((loop) =>
      loop.map(([column, row]): [number, number] => [
        roundFitted(cornerX + (firstColumn + column) * cellSize, decimals),
        roundFitted(cornerY + (firstRow + row) * cellSize, decimals),
      ]),
    );
};
