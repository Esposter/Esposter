import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import homeBuilding1 from "@/assets/dungeons/scene/world/Home/HomeBuilding1/tilemap.json";
import homeBuilding2 from "@/assets/dungeons/scene/world/Home/HomeBuilding2/tilemap.json";
import home from "@/assets/dungeons/scene/world/Home/tilemap.json";

export const TilemapLoaderMap: Record<TilemapKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [TilemapKey.Home]: (scene) => scene.load.tilemapTiledJSONExternal(TilemapKey.Home, home),
  [TilemapKey.HomeBuilding1]: (scene) => scene.load.tilemapTiledJSONExternal(TilemapKey.HomeBuilding1, homeBuilding1),
  [TilemapKey.HomeBuilding2]: (scene) => scene.load.tilemapTiledJSONExternal(TilemapKey.HomeBuilding2, homeBuilding2),
};
