import background from "@/assets/dungeons/inventory/background.png";
import bag from "@/assets/dungeons/inventory/bag.png";
import { InventoryKey } from "@/models/dungeons/keys/image/InventoryKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const InventoryLoaderMap = {
  [InventoryKey.Bag]: (scene) => scene.load.image(InventoryKey.Bag, bag),
  [InventoryKey.InventoryBackground]: (scene) => scene.load.image(InventoryKey.InventoryBackground, background),
} as const satisfies Record<InventoryKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
