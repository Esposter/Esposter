import basicPlains from "@/assets/dungeons/thirdParty/axulart/tilesets/BasicPlains.png";
import beachAndCaves from "@/assets/dungeons/thirdParty/axulart/tilesets/BeachAndCaves.png";
import house from "@/assets/dungeons/thirdParty/axulart/tilesets/House.png";
import houseInterior from "@/assets/dungeons/thirdParty/axulart/tilesets/HouseInterior.png";
import bushes from "@/assets/dungeons/tilesets/Bushes.png";
import collision from "@/assets/dungeons/tilesets/Collision.png";
import encounter from "@/assets/dungeons/tilesets/Encounter.png";
import entrance from "@/assets/dungeons/tilesets/Entrance.png";
import grass from "@/assets/dungeons/tilesets/Grass.png";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const TilesetLoaderMap: Record<TilesetKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [TilesetKey.BasicPlains]: (scene) => scene.load.image(TilesetKey.BasicPlains, basicPlains),
  [TilesetKey.BeachAndCaves]: (scene) => scene.load.image(TilesetKey.BeachAndCaves, beachAndCaves),
  [TilesetKey.House]: (scene) => scene.load.image(TilesetKey.House, house),
  [TilesetKey.HouseInterior]: (scene) =>
    scene.load.spritesheet(TilesetKey.HouseInterior, houseInterior, { frameWidth: 64, frameHeight: 64 }),

  [TilesetKey.Bushes]: (scene) => scene.load.image(TilesetKey.Bushes, bushes),
  [TilesetKey.Collision]: (scene) => scene.load.image(TilesetKey.Collision, collision),
  [TilesetKey.Encounter]: (scene) => scene.load.image(TilesetKey.Encounter, encounter),
  [TilesetKey.Entrance]: (scene) => scene.load.image(TilesetKey.Entrance, entrance),
  [TilesetKey.Grass]: (scene) => scene.load.image(TilesetKey.Grass, grass),
};
