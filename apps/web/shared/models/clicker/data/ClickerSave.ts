import type { BoughtBuilding } from "#shared/models/clicker/data/building/BoughtBuilding";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import type { ItemEntityType, ToData } from "@esposter/shared";

import { boughtBuildingSchema } from "#shared/models/clicker/data/building/BoughtBuilding";
import { buildingIdSchema } from "#shared/models/clicker/data/building/BuildingId";
import { ClickerType, clickerTypeSchema } from "#shared/models/clicker/data/ClickerType";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createItemEntityTypeSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export class ClickerSave extends AItemEntity implements ItemEntityType<ClickerType> {
  boughtBuildings: BoughtBuilding[] = [];
  boughtUpgrades: UpgradeId[] = [];
  pointCount = 0;
  type = ClickerType.Default;

  constructor(init?: Partial<ClickerSave>) {
    super();
    Object.assign(this, init);
  }
}

export const clickerSaveSchema = z.object({
  ...aItemEntitySchema.shape,
  ...createItemEntityTypeSchema(clickerTypeSchema).shape,
  // Each is unique over an enum, so the enum's size is the most either can hold
  boughtBuildings: createUniqueArraySchema(boughtBuildingSchema, "id").max(buildingIdSchema.options.length),
  boughtUpgrades: createUniqueArraySchema(upgradeIdSchema).max(upgradeIdSchema.options.length),
  pointCount: z.number().nonnegative(),
}) satisfies z.ZodType<ToData<ClickerSave>>;
