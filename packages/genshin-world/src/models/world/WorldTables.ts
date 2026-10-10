import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { StatTables } from "#src/models/character/StatTables";
import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { HudInterfaceRects } from "#src/models/hud/HudInterfaceRects";
import type { MaterialData } from "#src/models/inventory/MaterialData";

// The game's names and tables, read from the hosted game data before the world's screen opens its session
export interface WorldTables {
  // The game's rank, lock and world level tables, which the rank, the World Level and the camps' levels are read from
  adventureRankTables: AdventureRankTables;
  // The game's enemy tables, which the camps spawn their enemies from and every strike reads
  enemyTables: EnemyTables;
  // The HUD's pieces' rects as the game's tree places them
  hudInterfaceRects: HudInterfaceRects;
  // The game's material table by item id, which every item the bag takes in is defined from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The game's names in the reader's language, by their text ids, which the bag and the pick ups read their names from
  nameText: Readonly<Record<string, string>>;
  // The combat talent multipliers of the team the world starts with, so its first frame has each member's combatant
  startingTalentMultipliers: TalentMultiplierMap;
  // The game's stat tables a character is made and summed from
  statTables: StatTables;
}
