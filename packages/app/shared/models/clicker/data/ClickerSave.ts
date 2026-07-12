import type { BoughtBuilding } from "#shared/models/clicker/data/building/BoughtBuilding";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import type { ItemEntityType, ToData } from "@esposter/shared";

import { boughtBuildingSchema } from "#shared/models/clicker/data/building/BoughtBuilding";
import { ClickerType, clickerTypeSchema } from "#shared/models/clicker/data/ClickerType";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createItemEntityTypeSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export class ClickerSave extends AItemEntity implements ItemEntityType<ClickerType> {
  boughtBuildings: BoughtBuilding[] = [];
  boughtUpgrades: UpgradeId[] = [];
  noPoints = 0;
  type = ClickerType.Default;

  constructor(init?: Partial<ClickerSave>) {
    super();
    Object.assign(this, init);
  }
}

export const clickerSaveSchema = z.object({
  ...aItemEntitySchema.shape,
  ...createItemEntityTypeSchema(clickerTypeSchema).shape,
  boughtBuildings: createUniqueArraySchema(boughtBuildingSchema, "id"),
  boughtUpgrades: createUniqueArraySchema(upgradeIdSchema),
  id: z.uuid(),
  noPoints: z.number(),
}) satisfies z.ZodType<ToData<ClickerSave>>;
