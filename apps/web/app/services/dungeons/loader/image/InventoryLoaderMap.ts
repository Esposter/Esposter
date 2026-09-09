import type { AssetLoader } from "@/models/dungeons/loader/AssetLoader";

import { InventoryKey } from "#shared/models/dungeons/keys/image/InventoryKey";
import background from "@/assets/dungeons/scene/inventory/background.png";
import bag from "@/assets/dungeons/scene/inventory/bag.png";

export const InventoryLoaderMap = {
  [InventoryKey.Bag]: (scene) => scene.load.image(InventoryKey.Bag, bag),
  [InventoryKey.InventoryBackground]: (scene) => scene.load.image(InventoryKey.InventoryBackground, background),
} as const satisfies Record<InventoryKey, AssetLoader>;
