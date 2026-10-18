import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { Character } from "#src/models/character/Character";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";
import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { HomePlacement } from "#src/models/home/HomePlacement";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { Party } from "#src/models/party/Party";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";
import type { WishDrawSave } from "#src/models/wish/WishDrawSave";
import type { WishPity } from "#src/models/wish/WishPity";
import type { BannerKind } from "genshin-interface/save";

// The systems a save holds as the world reads them: the bag, the wallet, the ids of the chests opened, each carried
// Quest's progress by its id, the ids of the landmarks resonated with, each achievement's progress by its id, the
// Adventure EXP, Mondstadt's Reputation, each Character's Companionship EXP by its id, the characters held with each
// One's copy count by its id, the day's Commissions with the moment they were dealt, each kind of wish's Counters, the
// Wish history, the Bench's learned recipes and each recipe's Crafted count by its id, the Archive's opened entries by
// Section and its defeat counts by entry id, the Frostbearing Tree's offering Progress, the furnishings placed in the
// Realm, each Region's Statues of The Seven progress by the Region's id, the ids of the Oculi found, the ids of the
// Seelies settled and the puzzles solved, the World Level adjustment, the name chosen for The Traveler, the party, the
// Cooking progress and processing queues, and the purchases of each limited good that still count against its limit.
// Each defeated enemy's moment of coming back by its spawn key, in the camps with no boss among them, the save's slices
// Convert to and from these
export interface GenshinSaveState {
  achievementProgressMap: ReadonlyMap<number, AchievementProgress>;
  adventureExp: number;
  archiveKillsMap: ArchiveKills;
  archiveProgressMap: ArchiveProgress;
  characterCopyCountMap: ReadonlyMap<number, number>;
  characters: Character[];
  clearedCamps: readonly ClearedCamp[];
  clearedDomainIds: ReadonlySet<string>;
  commissionDay: CommissionDay;
  companionshipExpMap: ReadonlyMap<number, number>;
  cookingProgress: CookingProgress;
  craftedCountMap: ReadonlyMap<number, number>;
  craftingProgress: CraftingProgress;
  encounterPoints: EncounterPoints;
  longTermEncounterPoints: LongTermEncounterPoints;
  enemyRespawnMap: ReadonlyMap<string, string>;
  foundOculusIds: ReadonlySet<string>;
  frostbearingTreeProgress: OfferingProgressSave;
  homePlacements: HomePlacement[];
  inventory: Inventory;
  openedChestIds: ReadonlySet<string>;
  party: Party;
  processingJobs: Record<number, ProcessingJob>;
  quests: ReadonlyMap<string, QuestProgress>;
  regionStatueProgressMap: ReadonlyMap<string, StatueRegionProgressSave>;
  reputation: ReputationProgress;
  settledSeelieIds: ReadonlySet<string>;
  shopPurchases: ShopPurchase[];
  // The Abyss's progress by cycle, keyed as the save keys it
  spiralAbyssProgressMap: ReadonlyMap<string, AbyssProgress>;
  solvedPuzzleIds: ReadonlySet<string>;
  travelerName: string;
  unlockedLandmarkIds: ReadonlySet<string>;
  wallet: Wallet;
  wishHistory: WishDrawSave[];
  wishPityMap: Readonly<Record<BannerKind, Readonly<WishPity>>>;
  worldLevelAdjustment: WorldLevelAdjustment;
}
