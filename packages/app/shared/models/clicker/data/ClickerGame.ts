import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { ToData } from "#shared/models/entity/ToData";
import type { Type } from "arktype";

import { buildingWithStatsSchema } from "#shared/models/clicker/data/building/BuildingWithStats";
import { ClickerType, clickerTypeSchema } from "#shared/models/clicker/data/ClickerType";
import { createUpgradeSchema } from "#shared/models/clicker/data/upgrade/Upgrade";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { type } from "arktype";

export class ClickerGame extends AItemEntity {
  boughtBuildings: BuildingWithStats[] = [];
  boughtUpgrades: Upgrade[] = [];
  noPoints = 0;
  type = ClickerType.Default;
}

export const clickerGameSchema = aItemEntitySchema.merge(
  type({
    boughtBuildings: buildingWithStatsSchema.array(),
    boughtUpgrades: createUpgradeSchema(upgradeIdSchema).array(),
    id: "string.uuid.v4",
    noPoints: "number",
    type: clickerTypeSchema,
  }),
) satisfies Type<ToData<ClickerGame>>;
