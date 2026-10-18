import { achievementProgressSaveSchema } from "#src/models/achievement/AchievementProgressSave";
import { adventureExpSaveSchema } from "#src/models/adventureRank/AdventureExpSave";
import { worldLevelAdjustmentSaveSchema } from "#src/models/adventureRank/WorldLevelAdjustmentSave";
import { characterSaveSchema } from "#src/models/character/CharacterSave";
import { openedChestSaveSchema } from "#src/models/chest/OpenedChestSave";
import { craftingSaveSchema } from "#src/models/crafting/CraftingSave";
import { companionshipExpSaveSchema } from "#src/models/friendship/CompanionshipExpSave";
import { inventorySaveSchema } from "#src/models/inventory/InventorySave";
import { walletSaveSchema } from "#src/models/inventory/WalletSave";
import { unlockedLandmarkSaveSchema } from "#src/models/map/UnlockedLandmarkSave";
import { offeringProgressSaveSchema } from "#src/models/offering/OfferingProgressSave";
import { questProgressSaveSchema } from "#src/models/quest/QuestProgressSave";
import { reputationProgressSaveSchema } from "#src/models/reputation/ReputationProgressSave";
import { wishPityMapSaveSchema } from "#src/models/wish/WishPityMapSave";
import { MAX_CHARACTER_COUNT, MAX_GENSHIN_SAVE_LENGTH, MAX_TRAVELER_NAME_LENGTH } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The whole of a player's Genshin save: one key per system, each system's slice owned beside its model. The save holds
// What the player did and nothing derived, so a rule reads its value again on load
export const genshinSaveSchema = z
  .object({
    achievements: achievementProgressSaveSchema,
    adventureExp: adventureExpSaveSchema,
    // The characters the player holds, each once by its id, with the copies a wish has granted it
    characters: createUniqueArraySchema(characterSaveSchema, "id").max(MAX_CHARACTER_COUNT),
    companionshipExp: companionshipExpSaveSchema,
    crafting: craftingSaveSchema,
    inventory: inventorySaveSchema,
    offerings: z.object({ frostbearingTree: offeringProgressSaveSchema }),
    openedChests: openedChestSaveSchema,
    quests: questProgressSaveSchema,
    reputation: reputationProgressSaveSchema,
    // The name the player chose for the Traveler, empty while none is chosen
    travelerName: z.string().max(MAX_TRAVELER_NAME_LENGTH),
    unlockedLandmarks: unlockedLandmarkSaveSchema,
    wallet: walletSaveSchema,
    wishPity: wishPityMapSaveSchema,
    worldLevelAdjustment: worldLevelAdjustmentSaveSchema,
  })
  .refine((save) => JSON.stringify(save).length <= MAX_GENSHIN_SAVE_LENGTH, "The save is too large");

export type GenshinSave = z.infer<typeof genshinSaveSchema>;
