import home from "@/assets/dungeons/world/home/tilemap.json";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const TilemapLoaderMap: Record<TilemapKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [TilemapKey.Home]: (scene) => scene.load.tilemapTiledJSON(TilemapKey.Home, home),
};
