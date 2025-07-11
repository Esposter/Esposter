import type { Effect } from "#shared/models/clicker/data/effect/Effect";
import type { UnlockCondition } from "#shared/models/clicker/data/unlockCondition/UnlockCondition";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";

import { effectSchema } from "#shared/models/clicker/data/effect/Effect";
import { unlockConditionSchema } from "#shared/models/clicker/data/unlockCondition/UnlockCondition";
import { z } from "zod";

export interface Upgrade<TId extends string = UpgradeId> {
  description: string;
  effects: Effect[];
  flavorDescription: string;
  id: TId;
  price: number;
  unlockConditions: UnlockCondition[];
}

export const createUpgradeSchema = <T extends z.ZodType<string> = z.ZodType<UpgradeId>>(idSchema: T) =>
  z.object({
    description: z.string().min(1),
    effects: effectSchema.array().min(1),
    flavorDescription: z.string().min(1),
    id: idSchema,
    price: z.number(),
    unlockConditions: unlockConditionSchema.array(),
  });
