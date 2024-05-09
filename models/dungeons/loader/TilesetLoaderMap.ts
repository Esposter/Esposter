import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const TilesetLoaderMap: Record<TilesetKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [TilesetKey.BasicPlains]: (scene) =>
    scene.load.image(TilesetKey.BasicPlains, `/tilesets/axulart/${TilesetKey.BasicPlains}.png`),
  [TilesetKey.BeachAndCaves]: (scene) =>
    scene.load.image(TilesetKey.BeachAndCaves, `/tilesets/axulart/${TilesetKey.BeachAndCaves}.png`),
  [TilesetKey.House]: (scene) => scene.load.image(TilesetKey.House, `/tilesets/axulart/${TilesetKey.House}.png`),
  [TilesetKey.HouseInterior]: (scene) =>
    scene.load.spritesheet(TilesetKey.HouseInterior, `/tilesets/axulart/${TilesetKey.HouseInterior}.png`, {
      frameWidth: 64,
      frameHeight: 64,
    }),

  [TilesetKey.Bushes]: (scene) => scene.load.image(TilesetKey.Bushes, `/tilesets/firstParty/${TilesetKey.Bushes}.png`),
  [TilesetKey.Collision]: (scene) =>
    scene.load.image(TilesetKey.Collision, `/tilesets/firstParty/${TilesetKey.Collision}.png`),
  [TilesetKey.Dungeon]: (scene) =>
    scene.load.spritesheet(TilesetKey.Dungeon, `/tilesets/firstParty/${TilesetKey.Dungeon}.png`, {
      frameWidth: 16,
      frameHeight: 16,
    }),
  [TilesetKey.Encounter]: (scene) =>
    scene.load.image(TilesetKey.Encounter, `/tilesets/firstParty/${TilesetKey.Encounter}.png`),
  [TilesetKey.Entrance]: (scene) =>
    scene.load.image(TilesetKey.Entrance, `/tilesets/firstParty/${TilesetKey.Entrance}.png`),
  [TilesetKey.Grass]: (scene) => scene.load.image(TilesetKey.Grass, `/tilesets/firstParty/${TilesetKey.Grass}.png`),
};
