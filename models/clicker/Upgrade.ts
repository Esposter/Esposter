import type { Effect } from "@/models/clicker/Effect";
import type { UnlockCondition } from "@/models/clicker/UnlockCondition";
import type { UpgradeName } from "@/models/clicker/UpgradeName";

export interface Upgrade<TName = UpgradeName> {
  name: TName;
  description: string;
  flavorDescription: string;
  price: number;
  effects: Effect[];
  unlockConditions: UnlockCondition[];
}
