import { INVESTIGATION_DAILY_CAP } from "#src/services/investigation/constants";
import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// The game day's investigations as the save holds them: how many were made, up to the daily cap, and the moment the
// Day's count began as an ISO string, or an empty string before the day's first investigation
export const investigationDaySaveSchema = z.object({
  count: z.int().min(0).max(INVESTIGATION_DAILY_CAP),
  dayKey: z.union([z.literal(""), z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH)]),
});

export type InvestigationDaySave = z.infer<typeof investigationDaySaveSchema>;
