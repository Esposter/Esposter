import { BaseTilesetKey } from "#shared/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import { TilesetUrlMap } from "#src/services/dungeons/loader/TilesetUrlMap";
import { describe, expect, test } from "vitest";

describe("tilesetUrlMap", () => {
  // The map is read from the tileset folders, so a tileset with no definition file is missing rather than a type error
  test("holds a definition for every tileset but the dungeon spritesheet", () => {
    expect.hasAssertions();

    expect(Object.keys(TilesetUrlMap).toSorted()).toStrictEqual(Object.values(BaseTilesetKey).toSorted());
  });
});
