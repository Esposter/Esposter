import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { CharacterTalentKit } from "#src/models/character/CharacterTalentKit";
import type { StatTables } from "#src/models/character/StatTables";
import type { TalentUpgradeMap } from "#src/models/character/TalentUpgradeMap";
import type { CraftingBenchPlace } from "#src/models/crafting/CraftingBenchPlace";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { HudInterfaceRects } from "#src/models/hud/HudInterfaceRects";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Kit } from "#src/models/kit/Kit";
import type { FrostbearingTreePlace } from "#src/models/offering/FrostbearingTreePlace";
import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";
import type { Seelie } from "#src/models/puzzle/Seelie";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { WildlifePlace } from "#src/models/wildlife/WildlifePlace";
import type { WindriseData } from "#src/models/windrise/WindriseData";
import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";
import type { Catalogue } from "#src/models/world/Catalogue";

// The game's names and tables and the world's own records, read from the hosted game data before the world's screen
// Opens its session
export interface WorldTables {
  // The game's rank, lock and world level tables, which the rank, the World Level and the camps' levels are read from
  adventureRankTables: AdventureRankTables;
  // The regions and their areas, which the map draws, the region data is fetched by and the weather is read from
  catalogue: Catalogue;
  // Each character's kit as the game's tables hold it, the proud skill group of each combat talent, which the Talents tab
  // Reads a talent's upgrades by
  characterTalentKits: CharacterTalentKit[];
  // The crafting bench's place in Mondstadt, in the region's axes, which its prompt stands on
  craftingBenchPlace: CraftingBenchPlace;
  // The bench's recipes in the game's order, which the crafting screen offers the learned ones of
  craftingRecipes: CraftingRecipe[];
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
  // Each city vendor's shop's goods, by the shop's id, which a vendor's talk opens the shop of
  shopGoodMap: ReadonlyMap<number, ShopGood[]>;
  // The kits of the team the world starts with, by character id, so its first frame has each member's combatant
  startingCharacterIdKitMap: ReadonlyMap<number, Kit>;
  // The game's stat tables a character is made and summed from
  statTables: StatTables;
  // The game's talent upgrades by proud skill group, the level and phase and Mora and items each combat talent's next
  // Level takes
  talentUpgradeMap: TalentUpgradeMap;
  // The Time Trial Challenges of Mondstadt, each started from its marker in the world
  timeTrialPlaces: PuzzlePlace[];
  // The Mondstadt animals the official map marks
  wildlifePlaces: WildlifePlace[];
  // Windrise's records and the regions' grounds, which the world's one ground and everything drawn on it are built from
  windriseData: WindriseData;
  // The wish schedule's event banners, each offered by the wish screen only inside its window
  wishSchedule: WishScheduleEvent[];
}
