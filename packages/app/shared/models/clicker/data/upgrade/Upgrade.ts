import type { Effect } from "#shared/models/clicker/data/effect/Effect";
import type { UnlockCondition } from "#shared/models/clicker/data/unlockCondition/UnlockCondition";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import type { Description } from "#shared/models/entity/Description";

export interface Upgrade<TId extends string = UpgradeId> extends Description {
  effects: Effect[];
  flavorDescription: string;
  id: TId;
  price: number;
  unlockConditions: UnlockCondition[];
}
