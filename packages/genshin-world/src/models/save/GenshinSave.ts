import { achievementProgressSaveSchema } from "#src/models/achievement/AchievementProgressSave";
import { adventureExpSaveSchema } from "#src/models/adventureRank/AdventureExpSave";
import { companionshipExpSaveSchema } from "#src/models/friendship/CompanionshipExpSave";
import { inventorySaveSchema } from "#src/models/inventory/InventorySave";
import { walletSaveSchema } from "#src/models/inventory/WalletSave";
import { unlockedLandmarkSaveSchema } from "#src/models/map/UnlockedLandmarkSave";
import { questProgressSaveSchema } from "#src/models/quest/QuestProgressSave";
import { reputationProgressSaveSchema } from "#src/models/reputation/ReputationProgressSave";
import { wishPityMapSaveSchema } from "#src/models/wish/WishPityMapSave";
import { EMPTY_INVENTORY_SAVE, EMPTY_REPUTATION_SAVE, MAX_GENSHIN_SAVE_LENGTH } from "#src/services/save/constants";
import { InitialBannerKindWishPityMap } from "#src/services/wish/InitialBannerKindWishPityMap";
import { z } from "zod";

// The whole of a player's Genshin save: one key per system, each system's slice owned beside its model. The save holds
// What the player did and nothing derived, so a rule reads its value again on load. A slice a save predates reads as a
// New player's, so a save written before the slice was added keeps everything it held
export const genshinSaveSchema = z
  .object({
    achievements: achievementProgressSaveSchema.default({}),
    adventureExp: adventureExpSaveSchema.default(0),
    companionshipExp: companionshipExpSaveSchema.default({}),
    inventory: inventorySaveSchema.default(EMPTY_INVENTORY_SAVE),
    quests: questProgressSaveSchema,
    reputation: reputationProgressSaveSchema.default(EMPTY_REPUTATION_SAVE),
    unlockedLandmarks: unlockedLandmarkSaveSchema,
    wallet: walletSaveSchema,
    wishPity: wishPityMapSaveSchema.default(InitialBannerKindWishPityMap),
  })
  .refine((save) => JSON.stringify(save).length <= MAX_GENSHIN_SAVE_LENGTH, "The save is too large");

export type GenshinSave = z.infer<typeof genshinSaveSchema>;
