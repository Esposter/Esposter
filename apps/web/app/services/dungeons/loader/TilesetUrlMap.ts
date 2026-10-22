import axulartBasicPlains from "@/assets/dungeons/tilesets/axulart/BasicPlains.tsx?raw";
import axulartBeachAndCaves from "@/assets/dungeons/tilesets/axulart/BeachAndCaves.tsx?raw";
import axulartHouse from "@/assets/dungeons/tilesets/axulart/House.tsx?raw";
import axulartHouseInterior from "@/assets/dungeons/tilesets/axulart/HouseInterior.tsx?raw";
import firstPartyBushes from "@/assets/dungeons/tilesets/firstParty/Bushes.tsx?raw";
import firstPartyCollision from "@/assets/dungeons/tilesets/firstParty/Collision.tsx?raw";
import firstPartyEncounter from "@/assets/dungeons/tilesets/firstParty/Encounter.tsx?raw";
import firstPartyEntrance from "@/assets/dungeons/tilesets/firstParty/Entrance.tsx?raw";
import firstPartyGrass from "@/assets/dungeons/tilesets/firstParty/Grass.tsx?raw";
import firstPartyTeleport from "@/assets/dungeons/tilesets/firstParty/Teleport.tsx?raw";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { toXmlBlobUrl } from "@/util/file/toXmlBlobUrl";

// The external tileset loader reads each tileset's Tiled definition from a url, keyed by the tileset's name. The
// Definition is imported as text and handed over as a blob url, because a `.tsx` url is transformed as JavaScript by
// The dev server, which loads Nuxt's JSX plugin. The dungeon spritesheet has no definition, so it is not a tileset a map names
export const TilesetUrlMap = {
  [TilesetKey.BasicPlains]: toXmlBlobUrl(axulartBasicPlains),
  [TilesetKey.BeachAndCaves]: toXmlBlobUrl(axulartBeachAndCaves),
  [TilesetKey.Bushes]: toXmlBlobUrl(firstPartyBushes),
  [TilesetKey.Collision]: toXmlBlobUrl(firstPartyCollision),
  [TilesetKey.Encounter]: toXmlBlobUrl(firstPartyEncounter),
  [TilesetKey.Entrance]: toXmlBlobUrl(firstPartyEntrance),
  [TilesetKey.Grass]: toXmlBlobUrl(firstPartyGrass),
  [TilesetKey.House]: toXmlBlobUrl(axulartHouse),
  [TilesetKey.HouseInterior]: toXmlBlobUrl(axulartHouseInterior),
  [TilesetKey.Teleport]: toXmlBlobUrl(firstPartyTeleport),
} as const satisfies Record<Exclude<TilesetKey, typeof TilesetKey.Dungeon>, string>;
