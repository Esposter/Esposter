import type { SpritesheetAsset } from "#src/models/dungeons/loader/SpritesheetAsset";

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

export const TilesetAssetMap = {
  [TilesetKey.BasicPlains]: basicPlainsUrl,
  [TilesetKey.BeachAndCaves]: beachAndCavesUrl,
  [TilesetKey.Bushes]: bushesUrl,
  [TilesetKey.Collision]: collisionUrl,
  [TilesetKey.Dungeon]: { frameHeight: 16, frameWidth: 16, url: dungeonUrl },
  [TilesetKey.Encounter]: encounterUrl,
  [TilesetKey.Entrance]: entranceUrl,
  [TilesetKey.Grass]: grassUrl,
  [TilesetKey.House]: houseUrl,
  [TilesetKey.HouseInterior]: { frameHeight: 64, frameWidth: 64, url: houseInteriorUrl },
  [TilesetKey.Teleport]: teleportUrl,
} as const satisfies Record<TilesetKey, SpritesheetAsset | string>;
