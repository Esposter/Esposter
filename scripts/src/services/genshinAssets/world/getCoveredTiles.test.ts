import { getCoveredTiles } from "#src/services/genshinAssets/world/getCoveredTiles";
import { describe, expect, test } from "vitest";

describe(getCoveredTiles, () => {
  test("covers the one tile a point stands in when its reach stays inside it", () => {
    expect.hasAssertions();

    expect(getCoveredTiles({ x: 100, z: 100 }, 0)).toStrictEqual([{ column: 0, row: 0 }]);
  });

  test("covers every tile a square round a point crosses the borders of", () => {
    expect.hasAssertions();

    expect(getCoveredTiles({ x: 1024, z: -1024 }, 512)).toStrictEqual([
      { column: 0, row: -2 },
      { column: 0, row: -1 },
      { column: 1, row: -2 },
      { column: 1, row: -1 },
    ]);
  });
});
