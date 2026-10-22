import axulartBasicPlains from "@/assets/dungeons/tilesets/axulart/BasicPlains.tsx?url";
import axulartBeachAndCaves from "@/assets/dungeons/tilesets/axulart/BeachAndCaves.tsx?url";
import axulartHouse from "@/assets/dungeons/tilesets/axulart/House.tsx?url";
import axulartHouseInterior from "@/assets/dungeons/tilesets/axulart/HouseInterior.tsx?url";
import firstPartyBushes from "@/assets/dungeons/tilesets/firstParty/Bushes.tsx?url";
import firstPartyCollision from "@/assets/dungeons/tilesets/firstParty/Collision.tsx?url";
import firstPartyEncounter from "@/assets/dungeons/tilesets/firstParty/Encounter.tsx?url";
import firstPartyEntrance from "@/assets/dungeons/tilesets/firstParty/Entrance.tsx?url";
import firstPartyGrass from "@/assets/dungeons/tilesets/firstParty/Grass.tsx?url";
import firstPartyTeleport from "@/assets/dungeons/tilesets/firstParty/Teleport.tsx?url";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";

// The external tileset loader reads each tileset's Tiled definition by url, keyed by the tileset's name. The dungeon
// Spritesheet has no definition, so it is not a tileset a map names
export const TilesetUrlMap = {
  [TilesetKey.BasicPlains]: axulartBasicPlains,
  [TilesetKey.BeachAndCaves]: axulartBeachAndCaves,
  [TilesetKey.Bushes]: firstPartyBushes,
  [TilesetKey.Collision]: firstPartyCollision,
  [TilesetKey.Encounter]: firstPartyEncounter,
  [TilesetKey.Entrance]: firstPartyEntrance,
  [TilesetKey.Grass]: firstPartyGrass,
  [TilesetKey.House]: axulartHouse,
  [TilesetKey.HouseInterior]: axulartHouseInterior,
  [TilesetKey.Teleport]: firstPartyTeleport,
} as const satisfies Record<Exclude<TilesetKey, typeof TilesetKey.Dungeon>, string>;
