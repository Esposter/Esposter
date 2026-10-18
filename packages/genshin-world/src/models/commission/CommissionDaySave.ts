import { commissionProgressSchema } from "#src/models/commission/CommissionProgress";
import { COMMISSIONS_PER_DAY } from "#src/services/commission/constants";
import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The day's commissions as the save holds them: the four dealt, each unique by its id, the moment they were dealt as an
// ISO string, and the ids of those claimed so far, each unique and at most a day's four
export const commissionDaySaveSchema = z.object({
  claimedCommissionIds: createUniqueArraySchema(z.int().positive()).max(COMMISSIONS_PER_DAY),
  dealtAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
  dealtCommissions: createUniqueArraySchema(commissionProgressSchema, "commissionId").max(COMMISSIONS_PER_DAY),
});

export type CommissionDaySave = z.infer<typeof commissionDaySaveSchema>;
