import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";

import { EMPTY_REPUTATION_SAVE } from "#src/services/save/constants";
import { z } from "zod";

// Mondstadt's Reputation as the save holds it: its level, and the EXP toward the next
export const reputationProgressSaveSchema = z
  .object({ exp: z.int().nonnegative(), level: z.int().positive() })
  .prefault(EMPTY_REPUTATION_SAVE) satisfies z.ZodType<ReputationProgress>;

export type ReputationProgressSave = z.infer<typeof reputationProgressSaveSchema>;
