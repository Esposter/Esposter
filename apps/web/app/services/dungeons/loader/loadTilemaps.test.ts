import type { SceneWithPlugins } from "vue-phaserjs";

import { BaseTilesetKey } from "#shared/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import { loadTilemaps } from "#src/services/dungeons/loader/loadTilemaps";
import { createSceneWithPlugins } from "#src/services/phaser/createSceneWithPlugins.test";
import { CloudflareEnvironment, HostedAssetOriginMap } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

describe(loadTilemaps, () => {
  const origin = HostedAssetOriginMap[CloudflareEnvironment.Development];

  // A map names its tilesets by name, and each name resolves to a Tiled definition in the lock.
  // A tileset with no definition is missing at load, and nothing else fails.
  // The dungeon spritesheet has no definition, since it loads as an image.
  test("holds a Tiled definition for every tileset but the dungeon spritesheet", () => {
    expect.hasAssertions();

    const tilemapTiledJSONExternal = vi.fn<SceneWithPlugins["load"]["tilemapTiledJSONExternal"]>();
    const scene = Object.assign(createSceneWithPlugins(), { load: { tilemapTiledJSONExternal } });
    loadTilemaps(scene, origin);

    const [{ tilesetURLs }] = takeOne(tilemapTiledJSONExternal.mock.calls, 0);
    expect(Object.keys(tilesetURLs).toSorted()).toStrictEqual(Object.values(BaseTilesetKey).toSorted());
  });
});
