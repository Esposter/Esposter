import { BuildingWithStats, buildingWithStatsSchema } from "@/models/clicker/BuildingWithStats";
import { createUpgradeSchema, Upgrade } from "@/models/clicker/Upgrade";
import { upgradeNameSchema } from "@/models/clicker/UpgradeName";
import { z } from "zod";

export interface Game {
  noPoints: number;
  boughtUpgrades: Upgrade[];
  boughtBuildings: BuildingWithStats[];
  createdAt: Date;
}

export const gameSchema = z.object({
  noPoints: z.number(),
  boughtUpgrades: z.array(createUpgradeSchema(upgradeNameSchema)),
  boughtBuildings: z.array(buildingWithStatsSchema),
  createdAt: z.date(),
}) satisfies z.ZodType<Game>;
