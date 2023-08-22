import { BuildingWithStats, buildingWithStatsSchema } from "@/models/clicker/BuildingWithStats";
import { Upgrade, createUpgradeSchema } from "@/models/clicker/Upgrade";
import { upgradeNameSchema } from "@/models/clicker/UpgradeName";
import { ApplyItemMetadataMixin, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { z } from "zod";

export type Game = typeof Game.prototype;
export const Game = ApplyItemMetadataMixin(
  class Game {
    noPoints = 0;
    boughtUpgrades: Upgrade[] = [];
    boughtBuildings: BuildingWithStats[] = [];

    constructor(init?: Partial<Game>) {
      Object.assign(this, init);
    }

    toJSON() {
      return JSON.stringify({ ...this });
    }
  },
);

export const gameSchema = itemMetadataSchema.merge(
  z.object({
    noPoints: z.number(),
    boughtUpgrades: z.array(createUpgradeSchema(upgradeNameSchema)),
    boughtBuildings: z.array(buildingWithStatsSchema),
  }),
) satisfies z.ZodType<Omit<Game, "toJSON">>;
