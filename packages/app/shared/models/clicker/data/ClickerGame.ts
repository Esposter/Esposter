import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { ToData } from "#shared/models/entity/ToData";

import { buildingWithStatsSchema } from "#shared/models/clicker/data/building/BuildingWithStats";
import { ClickerType, clickerTypeSchema } from "#shared/models/clicker/data/ClickerType";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { applyItemMetadataMixin, itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { Serializable } from "#shared/models/entity/Serializable";
import { z } from "zod";

export type ClickerGame = typeof ClickerGame.prototype;

class BaseClickerGame extends Serializable {
  boughtBuildings: BuildingWithStats[] = [];
  boughtUpgrades: Upgrade[] = [];
  id: string = crypto.randomUUID();
  noPoints = 0;
  type = ClickerType.Default;
}
export const ClickerGame = applyItemMetadataMixin(BaseClickerGame);

export const clickerGameSchema = z
  .object({
    boughtBuildings: z.array(buildingWithStatsSchema),
    boughtUpgrades: z.array(createUpgradeSchema(upgradeIdSchema)),
    id: z.string().uuid(),
    noPoints: z.number(),
    type: clickerTypeSchema,
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<ToData<ClickerGame>>;
