import type { ImageFileKey } from "#shared/generated/phaser/FileKey";

import { FileKey } from "#shared/generated/phaser/FileKey";
import background from "#src/assets/dungeons/scene/inventory/background.png";
import bag from "#src/assets/dungeons/scene/inventory/bag.png";

export const InventoryAssetMap = {
  [FileKey.SceneInventoryBackground]: background,
  [FileKey.SceneInventoryBag]: bag,
} as const satisfies Partial<Record<ImageFileKey, string>>;
