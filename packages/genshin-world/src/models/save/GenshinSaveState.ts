import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { Character } from "#src/models/character/Character";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { Party } from "#src/models/party/Party";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { WishPity } from "#src/models/wish/WishPity";
import type { BannerKind } from "genshin-interface/save";

// The systems a save holds as the world reads them: the bag, the wallet, the ids of the chests opened, each carried quest's
// Progress by its id, the ids of the landmarks resonated with, each achievement's progress by its id, the Adventure EXP,
// Mondstadt's Reputation, each Character's Companionship EXP by its id, the characters held with each one's copy count by
// Its id, the day's Commissions with the moment they were dealt, each kind of wish's Counters, the bench's learned recipes
// And each recipe's Crafted count by its id, the Archive's opened entries by section and its defeat counts by entry id,
// The Frostbearing Tree's offering Progress, each region's Statues of The Seven Progress by the Region's id, the ids of
// The Oculi found, the ids of the Seelies settled and the puzzles solved, the World Level adjustment, the name chosen
// For The Traveler and the party. The save's Slices convert to and from these
export interface GenshinSaveState {
  achievementProgressMap: ReadonlyMap<number, AchievementProgress>;
  adventureExp: number;
  archiveKillsMap: ArchiveKills;
  archiveProgressMap: ArchiveProgress;
  characterCopyCountMap: ReadonlyMap<number, number>;
  characters: Character[];
  commissionDay: CommissionDay;
  companionshipExpMap: ReadonlyMap<number, number>;
  craftedCountMap: ReadonlyMap<number, number>;
  craftingProgress: CraftingProgress;
  foundOculusIds: ReadonlySet<string>;
  frostbearingTreeProgress: OfferingProgressSave;
  inventory: Inventory;
  openedChestIds: ReadonlySet<string>;
  party: Party;
  quests: ReadonlyMap<string, QuestProgress>;
  regionStatueProgressMap: ReadonlyMap<string, OfferingProgressSave>;
  reputation: ReputationProgress;
  settledSeelieIds: ReadonlySet<string>;
  solvedPuzzleIds: ReadonlySet<string>;
  travelerName: string;
  unlockedLandmarkIds: ReadonlySet<string>;
  wallet: Wallet;
  wishPityMap: Readonly<Record<BannerKind, Readonly<WishPity>>>;
  worldLevelAdjustment: WorldLevelAdjustment;
}
