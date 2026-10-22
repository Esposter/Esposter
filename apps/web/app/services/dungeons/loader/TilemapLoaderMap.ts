import type { AssetLoader } from "@/models/dungeons/loader/AssetLoader";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import homeBuilding1 from "@/assets/dungeons/scene/world/Home/HomeBuilding1/tilemap.json";
import homeBuilding2 from "@/assets/dungeons/scene/world/Home/HomeBuilding2/tilemap.json";
import home from "@/assets/dungeons/scene/world/Home/tilemap.json";
import { TilesetUrlMap } from "@/services/dungeons/loader/TilesetUrlMap";

export const TilemapLoaderMap = {
  [TilemapKey.Home]: (scene) =>
    scene.load.tilemapTiledJSONExternal({ key: TilemapKey.Home, tilesetURLs: TilesetUrlMap, url: home }),
  [TilemapKey.HomeBuilding1]: (scene) =>
    scene.load.tilemapTiledJSONExternal({
      key: TilemapKey.HomeBuilding1,
      tilesetURLs: TilesetUrlMap,
      url: homeBuilding1,
    }),
  [TilemapKey.HomeBuilding2]: (scene) =>
    scene.load.tilemapTiledJSONExternal({
      key: TilemapKey.HomeBuilding2,
      tilesetURLs: TilesetUrlMap,
      url: homeBuilding2,
    }),
} as const satisfies Record<TilemapKey, AssetLoader>;

export const TilemapLoaders = Object.values(TilemapLoaderMap);
