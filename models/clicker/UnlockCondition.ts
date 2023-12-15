import { type Target, targetSchema } from "@/models/clicker/Target";
import { z } from "zod";

export interface UnlockCondition {
  target: Target;
  amount: number;
}

export const unlockConditionSchema = z.object({
  target: targetSchema,
  amount: z.number().int(),
}) satisfies z.ZodType<UnlockCondition>;
