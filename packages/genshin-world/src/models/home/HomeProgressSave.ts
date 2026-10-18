import {
  MAX_HOME_BLUEPRINT_COUNT,
  MAX_HOME_COMPANION_COUNT,
  MAX_HOME_ORDER_COUNT,
  MAX_HOME_REWARD_CLAIM_COUNT,
} from "#src/services/home/constants";
import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// The realm's progress as the save holds it: each instant as an ISO string, and each list within its ceiling
export const homeProgressSaveSchema = z.object({
  accruedAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
  claimedRewardIds: z.array(z.int().positive()).max(MAX_HOME_REWARD_CLAIM_COUNT),
  companionIds: z.array(z.int().positive()).max(MAX_HOME_COMPANION_COUNT),
  learnedBlueprintIds: z.array(z.int().positive()).max(MAX_HOME_BLUEPRINT_COUNT),
  madeBlueprintIds: z.array(z.int().positive()).max(MAX_HOME_BLUEPRINT_COUNT),
  orders: z
    .array(z.object({ blueprintId: z.int().positive(), startedAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH) }))
    .max(MAX_HOME_ORDER_COUNT),
  realmBounty: z.int().nonnegative(),
  realmCurrency: z.int().nonnegative(),
  trustExp: z.int().nonnegative(),
});

export type HomeProgressSave = z.infer<typeof homeProgressSaveSchema>;
