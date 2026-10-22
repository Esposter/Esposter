import type { AssetLoader } from "@/models/dungeons/loader/AssetLoader";

import basicPlainsUrl from "@/assets/dungeons/tilesets/axulart/BasicPlains.png?url";
import beachAndCavesUrl from "@/assets/dungeons/tilesets/axulart/BeachAndCaves.png?url";
import houseUrl from "@/assets/dungeons/tilesets/axulart/House.png?url";
import houseInteriorUrl from "@/assets/dungeons/tilesets/axulart/HouseInterior.png?url";
import bushesUrl from "@/assets/dungeons/tilesets/firstParty/Bushes.png?url";
import collisionUrl from "@/assets/dungeons/tilesets/firstParty/Collision.png?url";
import dungeonUrl from "@/assets/dungeons/tilesets/firstParty/Dungeon.png?url";
import encounterUrl from "@/assets/dungeons/tilesets/firstParty/Encounter.png?url";
import entranceUrl from "@/assets/dungeons/tilesets/firstParty/Entrance.png?url";
import grassUrl from "@/assets/dungeons/tilesets/firstParty/Grass.png?url";
import teleportUrl from "@/assets/dungeons/tilesets/firstParty/Teleport.png?url";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";

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
