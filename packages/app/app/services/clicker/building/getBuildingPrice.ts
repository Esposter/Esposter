import type { Building } from "#shared/models/clicker/data/building/Building";

import { PRICE_GROWTH } from "@/services/clicker/constants";

// The idle-game-standard exponential curve: each owned unit multiplies the next unit's price
export const getBuildingPrice = (building: Building, boughtBuildingAmount: number) =>
  Math.trunc(building.basePrice * PRICE_GROWTH ** boughtBuildingAmount);
