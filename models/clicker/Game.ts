import { buildingWithStatsSchema } from "@/models/clicker/BuildingWithStats";
import type { BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import { ClickerType, clickerTypeSchema } from "@/models/clicker/ClickerType";
import { createUpgradeSchema } from "@/models/clicker/Upgrade";
import type { Upgrade } from "@/models/clicker/Upgrade";
import { upgradeNameSchema } from "@/models/clicker/UpgradeName";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import type { Except } from "@/util/types/Except";
import { z } from "zod";

class BaseGame {
  id = crypto.randomUUID() as string;
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
    boughtUpgrades: z.array(createUpgradeSchema(upgradeNameSchema)),
    boughtBuildings: z.array(buildingWithStatsSchema),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<Game, "toJSON">>;
