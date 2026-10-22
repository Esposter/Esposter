import type { Tilemaps } from "phaser";

import { addTilesetImage } from "@/services/dungeons/tilemap/addTilesetImage";
import { BASE_TILESET_KEYS } from "@/services/dungeons/tilemap/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

describe(addTilesetImage, () => {
  const tilesetKey = takeOne(BASE_TILESET_KEYS);

  // A tilemap's tileset is its own, so a second tilemap that asks for the same key gets one of its own
  test("adds a tileset once per tilemap and again to a new tilemap", () => {
    expect.hasAssertions();

    const firstAddTilesetImage = vi.fn<(key: string) => Tilemaps.Tileset>();
    const secondAddTilesetImage = vi.fn<(key: string) => Tilemaps.Tileset>();
    const firstTileset = {} as Tilemaps.Tileset;
    const secondTileset = {} as Tilemaps.Tileset;
    firstAddTilesetImage.mockReturnValue(firstTileset);
    secondAddTilesetImage.mockReturnValue(secondTileset);
    const firstTilemap = { addTilesetImage: firstAddTilesetImage } as unknown as Tilemaps.Tilemap;
    const secondTilemap = { addTilesetImage: secondAddTilesetImage } as unknown as Tilemaps.Tilemap;

    expect(addTilesetImage(firstTilemap, tilesetKey)).toBe(firstTileset);
    expect(addTilesetImage(firstTilemap, tilesetKey)).toBe(firstTileset);
    expect(addTilesetImage(secondTilemap, tilesetKey)).toBe(secondTileset);

    expect(firstAddTilesetImage).toHaveBeenCalledTimes(1);
    expect(secondAddTilesetImage).toHaveBeenCalledTimes(1);
  });
});
