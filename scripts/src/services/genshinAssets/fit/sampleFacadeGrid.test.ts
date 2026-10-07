import { sampleFacadeGrid } from "#src/services/genshinAssets/fit/sampleFacadeGrid";
import { describe, expect, test } from "vitest";

describe(sampleFacadeGrid, () => {
  test("keeps the partial cells at the far edges, read at the fine grid's last", () => {
    expect.hasAssertions();

    // A fine grid five wide and three high, each cell tagged with its own index
    const length = 15;
    const sampled = sampleFacadeGrid(
      {
        cellSize: 1,
        colors: Array.from({ length }, () => [0, 0, 0]),
        depths: Array.from({ length }, () => 0),
        height: 3,
        metals: Array.from({ length }, () => 0),
        tags: Array.from({ length }, (_value, cell) => cell),
        width: 5,
      },
      2,
    );

    expect(sampled).toMatchObject({ cellSize: 2, height: 2, tags: [6, 8, 9, 11, 13, 14], width: 3 });
  });
});
