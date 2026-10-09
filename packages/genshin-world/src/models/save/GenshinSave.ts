import { walletSaveSchema } from "#src/models/inventory/WalletSave";
import { unlockedLandmarkSaveSchema } from "#src/models/map/UnlockedLandmarkSave";
import { questProgressSaveSchema } from "#src/models/quest/QuestProgressSave";
import { MAX_GENSHIN_SAVE_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// The whole of a player's Genshin save: one key per system, each system's slice owned beside its model. The save holds
// What the player did and nothing derived, so a rule reads its value again on load
export const genshinSaveSchema = z
  .object({ quests: questProgressSaveSchema, unlockedLandmarks: unlockedLandmarkSaveSchema, wallet: walletSaveSchema })
  .refine((save) => JSON.stringify(save).length <= MAX_GENSHIN_SAVE_LENGTH, "The save is too large");

export type GenshinSave = z.infer<typeof genshinSaveSchema>;
