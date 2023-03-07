import type { BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import type { Upgrade } from "@/models/clicker/Upgrade";

export interface Game {
  noPoints: number;
  boughtUpgrades: Upgrade[];
  boughtBuildings: BuildingWithStats[];
  createdAt: Date;
}
