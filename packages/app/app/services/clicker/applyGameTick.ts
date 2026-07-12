import type { Clicker } from "#shared/models/clicker/data/Clicker";

import { FPS } from "@/services/clicker/constants";
import { applyBuildingUpgrade } from "@/services/clicker/upgrade/applyBuildingUpgrade";

// The single game tick: compute each bought building's power once, accumulate its lifetime
// ProducedValue, and add the summed power to the points balance
export const applyGameTick = (clicker: Clicker) => {
  let allBoughtBuildingPower = 0;
  for (const boughtBuilding of clicker.boughtBuildings) {
    const boughtBuildingPower = applyBuildingUpgrade(boughtBuilding, clicker.boughtUpgrades, clicker.boughtBuildings);
    boughtBuilding.producedValue += boughtBuildingPower / FPS;
    allBoughtBuildingPower += boughtBuildingPower;
  }
  clicker.noPoints += allBoughtBuildingPower / FPS;
};
