import type { AssetLoader } from "#src/models/dungeons/loader/AssetLoader";

import basicPlainsUrl from "#src/assets/dungeons/tilesets/axulart/BasicPlains.png";
import beachAndCavesUrl from "#src/assets/dungeons/tilesets/axulart/BeachAndCaves.png";
import houseUrl from "#src/assets/dungeons/tilesets/axulart/House.png";
import houseInteriorUrl from "#src/assets/dungeons/tilesets/axulart/HouseInterior.png";
import bushesUrl from "#src/assets/dungeons/tilesets/firstParty/Bushes.png";
import collisionUrl from "#src/assets/dungeons/tilesets/firstParty/Collision.png";
import dungeonUrl from "#src/assets/dungeons/tilesets/firstParty/Dungeon.png";
import encounterUrl from "#src/assets/dungeons/tilesets/firstParty/Encounter.png";
import entranceUrl from "#src/assets/dungeons/tilesets/firstParty/Entrance.png";
import grassUrl from "#src/assets/dungeons/tilesets/firstParty/Grass.png";
import teleportUrl from "#src/assets/dungeons/tilesets/firstParty/Teleport.png";
import { TilesetKey } from "#src/models/dungeons/keys/TilesetKey";

export const TilesetLoaderMap = {
  [TilesetKey.BasicPlains]: (scene) => scene.load.image(TilesetKey.BasicPlains, basicPlainsUrl),
  [TilesetKey.BeachAndCaves]: (scene) => scene.load.image(TilesetKey.BeachAndCaves, beachAndCavesUrl),
  [TilesetKey.Bushes]: (scene) => scene.load.image(TilesetKey.Bushes, bushesUrl),
  [TilesetKey.Collision]: (scene) => scene.load.image(TilesetKey.Collision, collisionUrl),
  [TilesetKey.Dungeon]: (scene) =>
    scene.load.spritesheet(TilesetKey.Dungeon, dungeonUrl, { frameHeight: 16, frameWidth: 16 }),
  [TilesetKey.Encounter]: (scene) => scene.load.image(TilesetKey.Encounter, encounterUrl),
  [TilesetKey.Entrance]: (scene) => scene.load.image(TilesetKey.Entrance, entranceUrl),
  [TilesetKey.Grass]: (scene) => scene.load.image(TilesetKey.Grass, grassUrl),
  [TilesetKey.House]: (scene) => scene.load.image(TilesetKey.House, houseUrl),
  [TilesetKey.HouseInterior]: (scene) =>
    scene.load.spritesheet(TilesetKey.HouseInterior, houseInteriorUrl, { frameHeight: 64, frameWidth: 64 }),
  [TilesetKey.Teleport]: (scene) => scene.load.image(TilesetKey.Teleport, teleportUrl),
} as const satisfies Record<TilesetKey, AssetLoader>;

export const TilesetLoaders = Object.values(TilesetLoaderMap);
