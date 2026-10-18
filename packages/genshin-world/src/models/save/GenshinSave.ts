import { achievementProgressSaveSchema } from "#src/models/achievement/AchievementProgressSave";
import { adventureExpSaveSchema } from "#src/models/adventureRank/AdventureExpSave";
import { worldLevelAdjustmentSaveSchema } from "#src/models/adventureRank/WorldLevelAdjustmentSave";
import { archiveSaveSchema } from "#src/models/archive/ArchiveSave";
import { characterSaveSchema } from "#src/models/character/CharacterSave";
import { openedChestSaveSchema } from "#src/models/chest/OpenedChestSave";
import { commissionDaySaveSchema } from "#src/models/commission/CommissionDaySave";
import { cookingSaveSchema } from "#src/models/cooking/CookingSave";
import { craftingSaveSchema } from "#src/models/crafting/CraftingSave";
import { clearedDomainSaveSchema } from "#src/models/domains/ClearedDomainSave";
import { enemyRespawnSaveSchema } from "#src/models/enemy/EnemyRespawnSave";
import { clearedCampSchema } from "#src/models/exploration/ClearedCamp";
import { companionshipExpSaveSchema } from "#src/models/friendship/CompanionshipExpSave";
import { homePlacementSaveSchema } from "#src/models/home/HomePlacementSave";
import { inventorySaveSchema } from "#src/models/inventory/InventorySave";
import { walletSaveSchema } from "#src/models/inventory/WalletSave";
import { unlockedLandmarkSaveSchema } from "#src/models/map/UnlockedLandmarkSave";
import { offeringProgressSaveSchema } from "#src/models/offering/OfferingProgressSave";
import { partySaveSchema } from "#src/models/party/PartySave";
import { puzzleProgressSaveSchema } from "#src/models/puzzle/PuzzleProgressSave";
import { questProgressSaveSchema } from "#src/models/quest/QuestProgressSave";
import { reputationProgressSaveSchema } from "#src/models/reputation/ReputationProgressSave";
import { shopPurchaseSaveSchema } from "#src/models/shop/ShopPurchaseSave";
import { statueProgressSaveSchema } from "#src/models/statue/StatueProgressSave";
import { wishDrawSaveSchema } from "#src/models/wish/WishDrawSave";
import { wishPityMapSaveSchema } from "#src/models/wish/WishPityMapSave";
import {
  MAX_CHARACTER_COUNT,
  MAX_CLEARED_CAMP_COUNT,
  MAX_GENSHIN_SAVE_LENGTH,
  MAX_SHOP_PURCHASE_COUNT,
  MAX_TRAVELER_NAME_LENGTH,
  MAX_WISH_HISTORY_COUNT,
} from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The whole of a player's Genshin save: one key per system, each system's slice owned beside its model. The save holds
// What the player did and nothing derived, so a rule reads its value again on load
export const genshinSaveSchema = z
  .object({
    achievements: achievementProgressSaveSchema,
    adventureExp: adventureExpSaveSchema,
    // The entries the Archive has opened and the defeats it has counted
    archive: archiveSaveSchema,
    // The characters the player holds, each once by its id, with the copies a wish has granted it
    characters: createUniqueArraySchema(characterSaveSchema, "id").max(MAX_CHARACTER_COUNT),
    // The camps the player has cleared, each once by its id, with the point it stands at
    clearedCamps: createUniqueArraySchema(clearedCampSchema, "id").max(MAX_CLEARED_CAMP_COUNT),
    // The one-time domains cleared, each once, so a repeat clear gives nothing
    clearedDomains: clearedDomainSaveSchema,
    // The day's four commissions and the moment they were dealt, a day dealt before the daily reset being dealt again
    commissionDay: commissionDaySaveSchema,
    companionshipExp: companionshipExpSaveSchema,
    // The cooking: the dishes learned, each dish's proficiency and each processing's queue, each by its id
    cooking: cookingSaveSchema,
    crafting: craftingSaveSchema,
    // Each defeated enemy's moment of coming back, by its spawn key, for the camps with no boss among them
    // On the server's clock
    enemyRespawns: enemyRespawnSaveSchema,
    // The furnishings placed in the realm, each with the area it stands in and where, in the order they were placed
    homePlacements: homePlacementSaveSchema,
    inventory: inventorySaveSchema,
    offerings: z.object({ frostbearingTree: offeringProgressSaveSchema }),
    openedChests: openedChestSaveSchema,
    // The party: its teams, the one deployed, the member on the field and the characters down
    party: partySaveSchema,
    // The Seelies settled in their courts and the puzzles solved, each by its id
    puzzles: puzzleProgressSaveSchema,
    quests: questProgressSaveSchema,
    reputation: reputationProgressSaveSchema,
    // The goods bought that still count against a limit, each good once, with how many were bought in its refresh window
    shopPurchases: z.array(shopPurchaseSaveSchema).max(MAX_SHOP_PURCHASE_COUNT).default([]),
    // The statues' progress in each region, and the Oculi found
    statues: statueProgressSaveSchema,
    // The name the player chose for the Traveler, empty while none is chosen
    travelerName: z.string().max(MAX_TRAVELER_NAME_LENGTH),
    unlockedLandmarks: unlockedLandmarkSaveSchema,
    wallet: walletSaveSchema,
    // The draws of the wish history, the newest last, each within the window the wish screen keeps
    wishHistory: z.array(wishDrawSaveSchema).max(MAX_WISH_HISTORY_COUNT),
    wishPity: wishPityMapSaveSchema,
    worldLevelAdjustment: worldLevelAdjustmentSaveSchema,
  })
  .refine((save) => JSON.stringify(save).length <= MAX_GENSHIN_SAVE_LENGTH, "The save is too large");

export type GenshinSave = z.infer<typeof genshinSaveSchema>;
