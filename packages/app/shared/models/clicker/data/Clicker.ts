import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { ToData } from "#shared/models/entity/ToData";

import { buildingWithStatsSchema } from "#shared/models/clicker/data/building/BuildingWithStats";
import { ClickerType, clickerTypeSchema } from "#shared/models/clicker/data/ClickerType";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { z } from "zod/v4";

export class Clicker extends AItemEntity implements ItemEntityType<ClickerType> {
  boughtBuildings: BuildingWithStats[] = [];
  boughtUpgrades: Upgrade[] = [];
  noPoints = 0;
  type = ClickerType.Default;

  constructor(init?: Partial<Clicker>) {
    super();
    Object.assign(this, init);
  }
}

export const clickerSchema = z.object({
  ...aItemEntitySchema.shape,
  ...createItemEntityTypeSchema(clickerTypeSchema).shape,
  boughtBuildings: buildingWithStatsSchema.array(),
  boughtUpgrades: createUpgradeSchema(upgradeIdSchema).array(),
  id: z.uuid(),
  noPoints: z.number(),
}) satisfies z.ZodType<ToData<Clicker>>;
