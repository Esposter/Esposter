import { InventoryKey } from "#shared/models/dungeons/keys/image/InventoryKey";
import background from "#src/assets/dungeons/scene/inventory/background.png";
import bag from "#src/assets/dungeons/scene/inventory/bag.png";

export const InventoryAssetMap = {
  [InventoryKey.Bag]: bag,
  [InventoryKey.InventoryBackground]: background,
} as const satisfies Record<InventoryKey, string>;
