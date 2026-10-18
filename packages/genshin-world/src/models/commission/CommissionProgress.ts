import { COMMISSION_UNLOCK_RANK } from "#src/services/commission/constants";
import { z } from "zod";

// One of the day's commissions as the player holds it: its count of finishing doings so far, and the Adventure Rank it was
// Dealt at, which is the rank its reward is paid for
export interface CommissionProgress {
  commissionId: number;
  count: number;
  dealtRank: number;
}

// A commission is dealt from the Adventure Rank commissions open at on, so no dealt rank is lower
export const commissionProgressSchema = z.object({
  commissionId: z.int().positive(),
  count: z.int().nonnegative(),
  dealtRank: z.int().min(COMMISSION_UNLOCK_RANK),
}) satisfies z.ZodType<CommissionProgress>;
