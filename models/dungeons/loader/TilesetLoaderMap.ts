import basicPlains from "@/assets/dungeons/axulart/tilesets/BasicPlains.png";
import beachAndCaves from "@/assets/dungeons/axulart/tilesets/BeachAndCaves.png";
import house from "@/assets/dungeons/axulart/tilesets/House.png";
import bushes from "@/assets/dungeons/tilesets/Bushes.png";
import collision from "@/assets/dungeons/tilesets/Collision.png";
import encounter from "@/assets/dungeons/tilesets/Encounter.png";
import grass from "@/assets/dungeons/tilesets/Grass.png";
import { TilesetKeyMap } from "@/models/dungeons/keys/TilesetKeyMap";
import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { type Loader } from "phaser";

export const TilesetLoaderMap: Record<keyof TilesetKeyMap, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [TilesetKeyMap.BasicPlains]: (scene) => scene.load.image(TilesetKeyMap.BasicPlains, basicPlains),
  [TilesetKeyMap.BeachAndCaves]: (scene) => scene.load.image(TilesetKeyMap.BeachAndCaves, beachAndCaves),
  [TilesetKeyMap.House]: (scene) => scene.load.image(TilesetKeyMap.House, house),

  [TilesetKeyMap.Bushes]: (scene) => scene.load.image(TilesetKeyMap.Bushes, bushes),
  [TilesetKeyMap.Collision]: (scene) => scene.load.image(TilesetKeyMap.Collision, collision),
  [TilesetKeyMap.Encounter]: (scene) => scene.load.image(TilesetKeyMap.Encounter, encounter),
  [TilesetKeyMap.Grass]: (scene) => scene.load.image(TilesetKeyMap.Grass, grass),
};
