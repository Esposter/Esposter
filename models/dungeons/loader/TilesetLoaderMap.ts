import basicPlains from "@/assets/dungeons/axulart/tilesets/BasicPlains.png";
import beachAndCaves from "@/assets/dungeons/axulart/tilesets/BeachAndCaves.png";
import house from "@/assets/dungeons/axulart/tilesets/House.png";
import bushes from "@/assets/dungeons/tilesets/Bushes.png";
import collision from "@/assets/dungeons/tilesets/Collision.png";
import encounter from "@/assets/dungeons/tilesets/Encounter.png";
import grass from "@/assets/dungeons/tilesets/Grass.png";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const TilesetLoaderMap: Record<TilesetKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [TilesetKey.BasicPlains]: (scene) => scene.load.image(TilesetKey.BasicPlains, basicPlains),
  [TilesetKey.BeachAndCaves]: (scene) => scene.load.image(TilesetKey.BeachAndCaves, beachAndCaves),
  [TilesetKey.House]: (scene) => scene.load.image(TilesetKey.House, house),

  [TilesetKey.Bushes]: (scene) => scene.load.image(TilesetKey.Bushes, bushes),
  [TilesetKey.Collision]: (scene) => scene.load.image(TilesetKey.Collision, collision),
  [TilesetKey.Encounter]: (scene) => scene.load.image(TilesetKey.Encounter, encounter),
  [TilesetKey.Grass]: (scene) => scene.load.image(TilesetKey.Grass, grass),
};
