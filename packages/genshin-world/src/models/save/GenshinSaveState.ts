import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";
import type { Character } from "#src/models/character/Character";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { WishPity } from "#src/models/wish/WishPity";
import type { BannerKind } from "genshin-interface/save";

// The systems a save holds as the world reads them: the bag, the wallet, the ids of the chests opened, each carried quest's
// Progress by its id, the ids of the landmarks resonated with, each achievement's progress by its id, the Adventure EXP, Mondstadt's Reputation, each
// Character's Companionship EXP by its id, the characters held with each one's copy count by its id, each kind of wish's
// Counters, the bench's learned recipes and each recipe's Crafted count by its id, the Frostbearing Tree's offering
// Progress, each region's Statues of The Seven progress by the region's id, the ids of the Oculi found, the World
// Level Adjustment and the name chosen for The Traveler. The save's slices convert to and from these
export interface GenshinSaveState {
  achievementProgressMap: ReadonlyMap<number, AchievementProgress>;
  adventureExp: number;
  characterCopyCountMap: ReadonlyMap<number, number>;
  characters: Character[];
  companionshipExpMap: ReadonlyMap<number, number>;
  craftedCountMap: ReadonlyMap<number, number>;
  craftingProgress: CraftingProgress;
  foundOculusIds: ReadonlySet<string>;
  frostbearingTreeProgress: OfferingProgressSave;
  inventory: Inventory;
  openedChestIds: ReadonlySet<string>;
  quests: ReadonlyMap<string, QuestProgress>;
  regionStatueProgressMap: ReadonlyMap<string, OfferingProgressSave>;
  reputation: ReputationProgress;
  travelerName: string;
  unlockedLandmarkIds: ReadonlySet<string>;
  wallet: Wallet;
  wishPityMap: Readonly<Record<BannerKind, Readonly<WishPity>>>;
  worldLevelAdjustment: WorldLevelAdjustment;
}
