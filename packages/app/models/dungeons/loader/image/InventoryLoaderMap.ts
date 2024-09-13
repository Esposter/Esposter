import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaser";

import background from "@/assets/dungeons/scene/inventory/background.png";
import bag from "@/assets/dungeons/scene/inventory/bag.png";
import { InventoryKey } from "@/models/dungeons/keys/image/InventoryKey";

export const InventoryLoaderMap = {
  [InventoryKey.Bag]: (scene) => scene.load.image(InventoryKey.Bag, bag),
  [InventoryKey.InventoryBackground]: (scene) => scene.load.image(InventoryKey.InventoryBackground, background),
} as const satisfies Record<InventoryKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
