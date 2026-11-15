import { TilesetKey } from "#src/models/dungeons/keys/TilesetKey";
import { TilesetUrlMap } from "#src/services/dungeons/loader/TilesetUrlMap";
import { describe, expect, test } from "vitest";

describe("tilesetUrlMap", () => {
  // The map is read from the tileset folders, so a tileset with no definition file is missing rather than a type error
  test("holds a definition for every tileset but the dungeon spritesheet", () => {
    expect.hasAssertions();

    expect(Object.keys(TilesetUrlMap).toSorted()).toStrictEqual(
      Object.values(TilesetKey)
        .filter((tilesetKey) => tilesetKey !== TilesetKey.Dungeon)
        .toSorted(),
    );
  });
});
