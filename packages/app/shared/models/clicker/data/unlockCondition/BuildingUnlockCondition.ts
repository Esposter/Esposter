import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import type { Type } from "arktype";

import { buildingIdSchema } from "#shared/models/clicker/data/building/BuildingId";
import { ItemType } from "#shared/models/clicker/data/ItemType";
import { type } from "arktype";

export interface BuildingUnlockCondition {
  amount: number;
  id: BuildingId;
  type: ItemType.Building;
}

export const buildingUnlockConditionSchema = type({
  amount: "number.integer",
  id: buildingIdSchema,
  type: type.enumerated(ItemType.Building),
}) satisfies Type<BuildingUnlockCondition>;
