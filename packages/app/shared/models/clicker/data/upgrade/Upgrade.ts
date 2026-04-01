import type { Effect } from "#shared/models/clicker/data/effect/Effect";
import type { UnlockCondition } from "#shared/models/clicker/data/unlockCondition/UnlockCondition";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import type { Description } from "#shared/models/entity/Description";

import { effectSchema } from "#shared/models/clicker/data/effect/Effect";
import { unlockConditionSchema } from "#shared/models/clicker/data/unlockCondition/UnlockCondition";
import { descriptionSchema } from "#shared/models/entity/Description";
import { z } from "zod";

export interface Upgrade<TId extends string = UpgradeId> extends Description {
  effects: Effect[];
  flavorDescription: string;
  id: TId;
  price: number;
  unlockConditions: UnlockCondition[];
}

export const createUpgradeSchema = <T extends z.ZodType<string> = z.ZodType<UpgradeId>>(idSchema: T) =>
  z.object({
    ...descriptionSchema.extend({ description: z.string().min(1) }).shape,
    effects: effectSchema.array().min(1),
    flavorDescription: z.string().min(1),
    id: idSchema,
    price: z.number(),
    unlockConditions: unlockConditionSchema.array(),
  });
