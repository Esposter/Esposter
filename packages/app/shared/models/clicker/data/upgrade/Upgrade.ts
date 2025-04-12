import type { Effect } from "#shared/models/clicker/data/effect/Effect";
import type { UnlockCondition } from "#shared/models/clicker/data/unlockCondition/UnlockCondition";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";

import { effectSchema } from "#shared/models/clicker/data/effect/Effect";
import { unlockConditionSchema } from "#shared/models/clicker/data/unlockCondition/UnlockCondition";
import { type } from "arktype";

export interface Upgrade<TId = UpgradeId> {
  description: string;
  effects: Effect[];
  flavorDescription: string;
  id: TId;
  price: number;
  unlockConditions: UnlockCondition[];
}

export const createUpgradeSchema = <T extends string = UpgradeId>(idSchema: type.Any<T>) =>
  type({
    description: "string > 0",
    effects: effectSchema.array().moreThanLength(0),
    flavorDescription: "string > 0",
    id: idSchema,
    price: "number",
    unlockConditions: unlockConditionSchema.array(),
  });
