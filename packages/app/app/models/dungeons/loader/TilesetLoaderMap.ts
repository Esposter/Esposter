import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AXULART_FOLDER_PATH, FIRST_PARTY_FOLDER_PATH } from "#shared/services/esposter/constants";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";

export const TilesetLoaderMap: Record<TilesetKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [TilesetKey.BasicPlains]: (scene) =>
    scene.load.image(TilesetKey.BasicPlains, `${AXULART_FOLDER_PATH}/${TilesetKey.BasicPlains}.png`),
  [TilesetKey.BeachAndCaves]: (scene) =>
    scene.load.image(TilesetKey.BeachAndCaves, `${AXULART_FOLDER_PATH}/${TilesetKey.BeachAndCaves}.png`),
  [TilesetKey.Bushes]: (scene) =>
    scene.load.image(TilesetKey.Bushes, `${FIRST_PARTY_FOLDER_PATH}/${TilesetKey.Bushes}.png`),
  [TilesetKey.Collision]: (scene) =>
    scene.load.image(TilesetKey.Collision, `${FIRST_PARTY_FOLDER_PATH}/${TilesetKey.Collision}.png`),
  [TilesetKey.Dungeon]: (scene) =>
    scene.load.spritesheet(TilesetKey.Dungeon, `${FIRST_PARTY_FOLDER_PATH}/${TilesetKey.Dungeon}.png`, {
      frameHeight: 16,
      frameWidth: 16,
    }),
  [TilesetKey.Encounter]: (scene) =>
    scene.load.image(TilesetKey.Encounter, `${FIRST_PARTY_FOLDER_PATH}/${TilesetKey.Encounter}.png`),
  [TilesetKey.Entrance]: (scene) =>
    scene.load.image(TilesetKey.Entrance, `${FIRST_PARTY_FOLDER_PATH}/${TilesetKey.Entrance}.png`),
  [TilesetKey.Grass]: (scene) =>
    scene.load.image(TilesetKey.Grass, `${FIRST_PARTY_FOLDER_PATH}/${TilesetKey.Grass}.png`),
  [TilesetKey.House]: (scene) => scene.load.image(TilesetKey.House, `${AXULART_FOLDER_PATH}/${TilesetKey.House}.png`),
  [TilesetKey.HouseInterior]: (scene) =>
    scene.load.spritesheet(TilesetKey.HouseInterior, `${AXULART_FOLDER_PATH}/${TilesetKey.HouseInterior}.png`, {
      frameHeight: 64,
      frameWidth: 64,
    }),
  [TilesetKey.Teleport]: (scene) =>
    scene.load.image(TilesetKey.Teleport, `${FIRST_PARTY_FOLDER_PATH}/${TilesetKey.Teleport}.png`),
};
