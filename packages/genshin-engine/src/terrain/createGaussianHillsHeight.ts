import type { GaussianHill } from "#src/models/terrain/GaussianHill";
import type { GaussianHills } from "#src/models/terrain/GaussianHills";

// A hill reaches three of its widths, past which it adds less than a hundredth of its height
const REACH_WIDTHS = 3;
// The side of the cells hills are filed in, in metres, so a height sums only the hills reaching its cell
const CELL_SIZE = 64;

const toCellKey = (column: number, row: number): string => `${column},${row}`;
// The height of a ground of Gaussian hills at any x and z: its base and every hill reaching that point, each hill filed
// Once under every cell its reach covers, so a point reads one cell's list
export const createGaussianHillsHeight = ({ base, hills }: GaussianHills): ((x: number, z: number) => number) => {
  const filed = hills.flatMap((hill) => {
    const reach = REACH_WIDTHS * hill.width;
    const cells: [string, GaussianHill][] = [];
    for (
      let column = Math.floor((hill.x - reach) / CELL_SIZE);
      column <= Math.floor((hill.x + reach) / CELL_SIZE);
      column++
    )
      for (let row = Math.floor((hill.z - reach) / CELL_SIZE); row <= Math.floor((hill.z + reach) / CELL_SIZE); row++)
        cells.push([toCellKey(column, row), hill]);
    return cells;
  });
  const cellHillsMap = new Map(
    Array.from(
      Map.groupBy(filed, ([key]) => key),
      ([key, entries]) => [key, entries.map(([, hill]) => hill)],
    ),
  );
  return (x, z) => {
    let total = base;
    for (const { height, width, x: hillX, z: hillZ } of cellHillsMap.get(
      toCellKey(Math.floor(x / CELL_SIZE), Math.floor(z / CELL_SIZE)),
    ) ?? [])
      total += height * Math.exp(-((x - hillX) ** 2 + (z - hillZ) ** 2) / (2 * width * width));
    return total;
  };
};
