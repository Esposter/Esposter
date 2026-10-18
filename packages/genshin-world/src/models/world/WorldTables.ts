import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { StatTables } from "#src/models/character/StatTables";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { HudInterfaceRects } from "#src/models/hud/HudInterfaceRects";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Kit } from "#src/models/kit/Kit";
import type { FrostbearingTreePlace } from "#src/models/offering/FrostbearingTreePlace";
import type { Seelie } from "#src/models/puzzle/Seelie";
import type { WildlifePlace } from "#src/models/wildlife/WildlifePlace";
import type { WindriseData } from "#src/models/windrise/WindriseData";
import type { Catalogue } from "#src/models/world/Catalogue";

// The game's names and tables and the world's own records, read from the hosted game data before the world's screen
// Opens its session
export interface WorldTables {
  // The game's rank, lock and world level tables, which the rank, the World Level and the camps' levels are read from
  adventureRankTables: AdventureRankTables;
  // The regions and their areas, which the map draws, the region data is fetched by and the weather is read from
  catalogue: Catalogue;
  // The game's enemy tables, which the camps spawn their enemies from and every strike reads
  enemyTables: EnemyTables;
  // The Frostbearing Trees' places in Mondstadt, each stood in the world
  frostbearingTreePlaces: FrostbearingTreePlace[];
  // The HUD's pieces' rects as the game's tree places them
  hudInterfaceRects: HudInterfaceRects;
  // The game's material table by item id, which every item the bag takes in is defined from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The game's names in the reader's language, by their text ids, which the bag and the pick ups read their names from
  nameText: Readonly<Record<string, string>>;
  // The Seelies of Mondstadt, each paired with its court, which a sight trail leads to while it rests
  seelies: Seelie[];
  // The kits of the team the world starts with, by character id, so its first frame has each member's combatant
  startingCharacterIdKitMap: ReadonlyMap<number, Kit>;
  // The game's stat tables a character is made and summed from
  statTables: StatTables;
  // The Mondstadt animals the official map marks
  wildlifePlaces: WildlifePlace[];
  // Windrise's records and the regions' grounds, which the world's one ground and everything drawn on it are built from
  windriseData: WindriseData;
}
