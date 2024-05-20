import { ClickerType, clickerTypeSchema } from "@/models/clicker/data/ClickerType";
import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
import { buildingWithStatsSchema } from "@/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";
import { createUpgradeSchema } from "@/models/clicker/data/upgrade/Upgrade";
import { upgradeIdSchema } from "@/models/clicker/data/upgrade/UpgradeId";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import type { Except } from "type-fest";
import { z } from "zod";

class BaseGame {
  id: string = crypto.randomUUID();
  type = ClickerType.Default;
  noPoints = 0;
  boughtUpgrades: Upgrade[] = [];
  boughtBuildings: BuildingWithStats[] = [];

  constructor(init?: Partial<BaseGame>) {
    Object.assign(this, init);
  }

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type Game = typeof Game.prototype;
export const Game = applyItemMetadataMixin(BaseGame);

export const gameSchema = z
  .object({
    id: z.string().uuid(),
    type: clickerTypeSchema,
    noPoints: z.number(),
    boughtUpgrades: z.array(createUpgradeSchema(upgradeIdSchema)),
    boughtBuildings: z.array(buildingWithStatsSchema),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<Game, "toJSON">>;
