import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { ToData } from "#shared/models/entity/ToData";

import { buildingWithStatsSchema } from "#shared/models/clicker/data/building/BuildingWithStats";
import { ClickerType, clickerTypeSchema } from "#shared/models/clicker/data/ClickerType";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

export class ClickerGame extends AItemEntity {
  boughtBuildings: BuildingWithStats[] = [];
  boughtUpgrades: Upgrade[] = [];
  noPoints = 0;
  type = ClickerType.Default;
}

export const clickerGameSchema = aItemEntitySchema.extend(
  z.object({
    boughtBuildings: z.array(buildingWithStatsSchema),
    boughtUpgrades: z.array(createUpgradeSchema(upgradeIdSchema)),
    id: z.uuid(),
    noPoints: z.number(),
    type: clickerTypeSchema,
  }),
) satisfies z.ZodType<ToData<ClickerGame>>;
