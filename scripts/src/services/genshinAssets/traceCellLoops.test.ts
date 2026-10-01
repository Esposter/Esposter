import { traceCellLoops } from "#src/services/genshinAssets/traceCellLoops";
import { describe, expect, test } from "vitest";

describe(traceCellLoops, () => {
  // A grid ten cells wide of half-metre cells from a corner at (1, 2)
  const grid = { cellSize: 0.5, corner: [1, 2], minCells: 4, tolerance: 0.5, width: 10 } as const;

  test("traces a block of cells in the grid's metres", () => {
    expect.hasAssertions();

    const cells = [12, 13, 22, 23];
    const [loop = []] = traceCellLoops(cells, grid);
    const xs = loop.map(([x]) => x);
    const ys = loop.map(([, y]) => y);

    expect([Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]).toStrictEqual([2, 3, 2.5, 3.5]);
  });

  test("drops a loop round fewer cells than asked", () => {
    expect.hasAssertions();

    expect(traceCellLoops([12, 13], grid)).toStrictEqual([]);
  });
});
