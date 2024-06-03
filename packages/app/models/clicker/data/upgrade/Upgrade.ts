import type { Effect } from "@/models/clicker/data/effect/Effect";
import { effectSchema } from "@/models/clicker/data/effect/Effect";
import type { UnlockCondition } from "@/models/clicker/data/unlockCondition/UnlockCondition";
import { unlockConditionSchema } from "@/models/clicker/data/unlockCondition/UnlockCondition";
import type { UpgradeId } from "@/models/clicker/data/upgrade/UpgradeId";
import { z } from "zod";

export interface Upgrade<TId = UpgradeId> {
  id: TId;
  description: string;
  flavorDescription: string;
  price: number;
  effects: Effect[];
  unlockConditions: UnlockCondition[];
}

export const createUpgradeSchema = <TIdSchema extends z.ZodType<string> = z.ZodType<UpgradeId>>(idSchema: TIdSchema) =>
  z.object({
    id: idSchema,
    description: z.string().min(1),
    flavorDescription: z.string().min(1),
    price: z.number(),
    effects: z.array(effectSchema).min(1),
    unlockConditions: z.array(unlockConditionSchema),
  });
