import type { HomePlant } from "#src/models/home/HomePlant";
import type { HomePlanting } from "#src/models/home/HomePlanting";
import type { Inventory } from "#src/models/inventory/Inventory";

import { checkIsItemCountsHeld } from "#src/services/inventory/checkIsItemCountsHeld";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";

// The bag and garden after one seed is planted on a plot at `now`: the seed taken from the bag, and the planting recorded
// On the plot. Undefined, with nothing spent, where the garden does not grow the seed, the plot already holds a planting,
// Or the bag holds none of the seed. The plot's field is not checked until the realm's layout export names the plots
export const plantHomeSeed = (
  { plotId, seedItemId }: { plotId: number; seedItemId: number },
  {
    inventory,
    now,
    plantings,
    plants,
  }: { inventory: Inventory; now: Temporal.Instant; plantings: HomePlanting[]; plants: HomePlant[] },
): undefined | { inventory: Inventory; plantings: HomePlanting[] } => {
  const seed = [{ count: 1, id: seedItemId }];
  const isGrown = plants.some((plant) => plant.seedItemId === seedItemId);
  const isPlotFree = !plantings.some((planting) => planting.plotId === plotId);
  if (!isGrown || !isPlotFree || !checkIsItemCountsHeld(inventory.items, seed, 1)) return undefined;
  return {
    inventory: { ...inventory, items: takeItemCounts(inventory.items, seed, 1) },
    plantings: [...plantings, { plantedAt: now, plotId, seedItemId }],
  };
};
