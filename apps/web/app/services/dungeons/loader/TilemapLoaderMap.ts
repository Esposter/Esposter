import type { AssetLoader } from "@/models/dungeons/loader/AssetLoader";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import homeBuilding1 from "@/assets/dungeons/scene/world/Home/HomeBuilding1/tilemap.json";
import homeBuilding2 from "@/assets/dungeons/scene/world/Home/HomeBuilding2/tilemap.json";
import home from "@/assets/dungeons/scene/world/Home/tilemap.json";

export const TilemapLoaderMap = {
  [TilemapKey.Home]: (scene) => scene.load.tilemapTiledJSONExternal(TilemapKey.Home, home),
  [TilemapKey.HomeBuilding1]: (scene) => scene.load.tilemapTiledJSONExternal(TilemapKey.HomeBuilding1, homeBuilding1),
  [TilemapKey.HomeBuilding2]: (scene) => scene.load.tilemapTiledJSONExternal(TilemapKey.HomeBuilding2, homeBuilding2),
} as const satisfies Record<TilemapKey, AssetLoader>;

export const TilemapLoaders = Object.values(TilemapLoaderMap);
