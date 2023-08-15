import { BuildingWithStats, buildingWithStatsSchema } from "@/models/clicker/BuildingWithStats";
import { Upgrade, createUpgradeSchema } from "@/models/clicker/Upgrade";
import { upgradeNameSchema } from "@/models/clicker/UpgradeName";
import { ItemMetadata, itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { z } from "zod";

export class Game implements ItemMetadata {
  noPoints = 0;
  boughtUpgrades: Upgrade[] = [];
  boughtBuildings: BuildingWithStats[] = [];
  createdAt = new Date();
  updatedAt = new Date();
  deletedAt: Date | null = null;

  constructor(init: Partial<Game>) {
    Object.assign(this, init);
  }

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export const gameSchema = itemMetadataSchema.merge(
  z.object({
    noPoints: z.number(),
    boughtUpgrades: z.array(createUpgradeSchema(upgradeNameSchema)),
    boughtBuildings: z.array(buildingWithStatsSchema),
  }),
) satisfies z.ZodType<Omit<Game, "toJSON" | "toClass">>;
