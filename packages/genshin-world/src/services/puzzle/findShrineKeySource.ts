import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ShrineKeySource } from "#src/models/puzzle/ShrineKeySource";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";

// The source of a Shrine of Depths key of a region the bag holds one of, or none when it holds no key of that region
export const findShrineKeySource = (
  keySources: readonly ShrineKeySource[],
  region: string,
  items: InventoryItem[],
): ShrineKeySource | undefined =>
  keySources.find(({ keyItemId, keyRegion }) => keyRegion === region && countInventoryItem(items, keyItemId) > 0);
