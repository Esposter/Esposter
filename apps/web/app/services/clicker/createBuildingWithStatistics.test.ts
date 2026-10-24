import type { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";

import { describe } from "vitest";

// A building the player owns `amount` of, with the unit values the effect and upgrade tests read
export const createBuildingWithStatistics = (id: BuildingId, amount: number): BuildingWithStatistics => ({
  amount,
  basePrice: 1,
  baseValue: 1,
  flavorDescription: "",
  id,
  producedValue: 0,
});

describe.todo("createBuildingWithStatistics");
