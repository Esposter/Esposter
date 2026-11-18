import { getTerrainSearchBlocks } from "#src/services/genshinAssets/world/getTerrainSearchBlocks";
import { describe, expect, test } from "vitest";

describe(getTerrainSearchBlocks, () => {
  test("searches every block naming a terrain asset once, in the index's order, the first pass's not among them", () => {
    expect.hasAssertions();

    const terrainAssets = [
      { block: "00/00945879.blk" },
      { block: "00/15306907.blk" },
      { block: "00/00945879.blk" },
      { block: "00/13138169.blk" },
    ];

    expect(getTerrainSearchBlocks(terrainAssets, ["00/00945879.blk"])).toStrictEqual([
      "00/15306907.blk",
      "00/13138169.blk",
    ]);
  });

  test("searches every such block when the first pass searched none", () => {
    expect.hasAssertions();

    expect(getTerrainSearchBlocks([{ block: "00/15306907.blk" }], [])).toStrictEqual(["00/15306907.blk"]);
  });

  test("searches nothing once every block naming a terrain asset was searched", () => {
    expect.hasAssertions();

    expect(getTerrainSearchBlocks([{ block: "00/00945879.blk" }], ["00/00945879.blk"])).toStrictEqual([]);
  });
});
