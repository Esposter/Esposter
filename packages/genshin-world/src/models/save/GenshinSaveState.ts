import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { WishPity } from "#src/models/wish/WishPity";
import type { BannerKind } from "genshin-interface/save";

// The systems a save holds as the world reads them: the bag, the wallet, each carried quest's progress by its id, the ids
// Of the landmarks resonated with, each achievement's progress by its id, the Adventure EXP, Mondstadt's Reputation, each
// Character's Companionship EXP by its id, each kind of wish's counters, and the bench's learned recipes and each
// Recipe's crafted count by its id, and the World Level adjustment. The save's slices convert to and from these
export interface GenshinSaveState {
  achievementProgressMap: ReadonlyMap<number, AchievementProgress>;
  adventureExp: number;
  companionshipExpMap: ReadonlyMap<number, number>;
  craftedCountMap: ReadonlyMap<number, number>;
  craftingProgress: CraftingProgress;
  inventory: Inventory;
  quests: ReadonlyMap<string, QuestProgress>;
  reputation: ReputationProgress;
  unlockedLandmarkIds: ReadonlySet<string>;
  wallet: Wallet;
  wishPityMap: Readonly<Record<BannerKind, Readonly<WishPity>>>;
  worldLevelAdjustment: WorldLevelAdjustment;
}
