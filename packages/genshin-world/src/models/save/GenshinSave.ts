import { achievementProgressSaveSchema } from "#src/models/achievement/AchievementProgressSave";
import { adventureExpSaveSchema } from "#src/models/adventureRank/AdventureExpSave";
import { companionshipExpSaveSchema } from "#src/models/friendship/CompanionshipExpSave";
import { inventorySaveSchema } from "#src/models/inventory/InventorySave";
import { walletSaveSchema } from "#src/models/inventory/WalletSave";
import { unlockedLandmarkSaveSchema } from "#src/models/map/UnlockedLandmarkSave";
import { questProgressSaveSchema } from "#src/models/quest/QuestProgressSave";
import { reputationProgressSaveSchema } from "#src/models/reputation/ReputationProgressSave";
import { wishPityMapSaveSchema } from "#src/models/wish/WishPityMapSave";
import { MAX_GENSHIN_SAVE_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// The whole of a player's Genshin save: one key per system, each system's slice owned beside its model. The save holds
// What the player did and nothing derived, so a rule reads its value again on load
export const genshinSaveSchema = z
  .object({
    achievements: achievementProgressSaveSchema,
    adventureExp: adventureExpSaveSchema,
    companionshipExp: companionshipExpSaveSchema,
    inventory: inventorySaveSchema,
    quests: questProgressSaveSchema,
    reputation: reputationProgressSaveSchema,
    unlockedLandmarks: unlockedLandmarkSaveSchema,
    wallet: walletSaveSchema,
    wishPity: wishPityMapSaveSchema,
  })
  .refine((save) => JSON.stringify(save).length <= MAX_GENSHIN_SAVE_LENGTH, "The save is too large");

export type GenshinSave = z.infer<typeof genshinSaveSchema>;
