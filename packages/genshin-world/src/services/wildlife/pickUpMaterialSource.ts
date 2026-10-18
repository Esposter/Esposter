import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { MaterialSourcePlace } from "#src/models/wildlife/MaterialSourcePlace";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";

// A material source picked up into the bag as its item, once: the bag takes it and the source is taken out of the world
// With it. One the bag has no room for stays where it lies, and what the bag has no room for is counted as overflow
export const pickUpMaterialSource = (
  materialSources: readonly MaterialSourcePlace[],
  placeId: string,
  inventory: Inventory,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): { inventory: Inventory; materialSources: MaterialSourcePlace[]; overflow: number } => {
  const place = materialSources.find(({ id }) => id === placeId);
  if (!place) return { inventory, materialSources: [...materialSources], overflow: 0 };
  const addition = addInventoryItem(inventory, getItemDefinition(place.kind, names, materialDataMap), 1);
  return {
    inventory: addition.inventory,
    materialSources: addition.overflow > 0 ? [...materialSources] : materialSources.filter(({ id }) => id !== placeId),
    overflow: addition.overflow,
  };
};
