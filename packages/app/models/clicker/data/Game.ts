import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { buildingWithStatsSchema } from "@/models/clicker/data/building/BuildingWithStats";
import { ClickerType, clickerTypeSchema } from "@/models/clicker/data/ClickerType";
import { createUpgradeSchema } from "@/models/clicker/data/upgrade/Upgrade";
import { upgradeIdSchema } from "@/models/clicker/data/upgrade/UpgradeId";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/shared/models/itemMetadata";
import { z } from "zod";

class BaseGame {
  boughtBuildings: BuildingWithStats[] = [];
  boughtUpgrades: Upgrade[] = [];
  id: string = crypto.randomUUID();
  noPoints = 0;
  type = ClickerType.Default;

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type Game = typeof Game.prototype;
export const Game = applyItemMetadataMixin(BaseGame);

export const gameSchema = z
  .object({
    boughtBuildings: z.array(buildingWithStatsSchema),
    boughtUpgrades: z.array(createUpgradeSchema(upgradeIdSchema)),
    id: z.string().uuid(),
    noPoints: z.number(),
    type: clickerTypeSchema,
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<Game, "toJSON">>;
