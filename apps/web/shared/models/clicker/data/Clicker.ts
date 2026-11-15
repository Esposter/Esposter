import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";
import type { z } from "zod";

// The in-memory game state with fully resolved definitions, derived from the persisted save so the two cannot drift
export type Clicker = Except<z.infer<typeof clickerSaveSchema>, "boughtBuildings" | "boughtUpgrades"> & {
  boughtBuildings: BuildingWithStatistics[];
  boughtUpgrades: Upgrade[];
};
