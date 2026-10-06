// The cells of a grid a row wide as rectangles: each row's runs of neighbouring cells, a run joined to the rectangle
// Under it while it spans the same columns and its value holds within the tolerance of the rectangle's first row's, so
// A rib stays one tall rectangle and a ragged shape keeps its outline row by row
export const findCellRectangles = (
  cells: readonly number[],
  { getValue, tolerance, width }: { getValue: (cell: number) => number; tolerance: number; width: number },
): { cells: number[]; columns: [number, number]; rows: [number, number] }[] => {
  const rowCellsMap = Map.groupBy(
    cells.toSorted((firstCell, secondCell) => firstCell - secondCell),
    (cell) => Math.floor(cell / width),
  );
  const rectangles: { cells: number[]; columns: [number, number]; rows: [number, number]; value: number }[] = [];
  // The rectangles whose top row is the row before, by their columns
  let openRectangleMap = new Map<string, (typeof rectangles)[number]>();
  for (const row of [...rowCellsMap.keys()].toSorted((firstRow, secondRow) => firstRow - secondRow)) {
    const runs: number[][] = [];
    for (const cell of rowCellsMap.get(row) ?? []) {
      const run = runs.at(-1);
      if (run && cell === (run.at(-1) ?? 0) + 1) run.push(cell);
      else runs.push([cell]);
    }
    const nextOpenRectangleMap = new Map<string, (typeof rectangles)[number]>();
    for (const run of runs) {
      const columns: [number, number] = [(run[0] ?? 0) % width, ((run.at(-1) ?? 0) % width) + 1];
      const key = columns.join("/");
      const values = run.map((cell) => getValue(cell)).toSorted((firstValue, secondValue) => firstValue - secondValue);
      const value = values[Math.floor(values.length / 2)] ?? 0;
      const open = openRectangleMap.get(key);
      if (open?.rows[1] === row && Math.abs(value - open.value) <= tolerance) {
        open.cells.push(...run);
        open.rows[1] = row + 1;
        nextOpenRectangleMap.set(key, open);
      } else {
        const rectangle = { cells: [...run], columns, rows: [row, row + 1] as [number, number], value };
        rectangles.push(rectangle);
        nextOpenRectangleMap.set(key, rectangle);
      }
    }
    openRectangleMap = nextOpenRectangleMap;
  }
  return rectangles.map(({ cells: rectangleCells, columns, rows }) => ({ cells: rectangleCells, columns, rows }));
};
