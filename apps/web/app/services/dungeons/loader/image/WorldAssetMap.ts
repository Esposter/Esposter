import type { ImageFileKey } from "#shared/generated/phaser/FileKey";

import { FileKey } from "#shared/generated/phaser/FileKey";
import worldHomeForeground from "#src/assets/dungeons/scene/world/Home/foreground.png";
import worldHomeBuilding1Foreground from "#src/assets/dungeons/scene/world/Home/HomeBuilding1/foreground.png";
import worldHomeBuilding2Foreground from "#src/assets/dungeons/scene/world/Home/HomeBuilding2/foreground.png";

export const WorldAssetMap = {
  [FileKey.SceneWorldHomeForeground]: worldHomeForeground,
  [FileKey.SceneWorldHomeHomeBuilding1Foreground]: worldHomeBuilding1Foreground,
  [FileKey.SceneWorldHomeHomeBuilding2Foreground]: worldHomeBuilding2Foreground,
} as const satisfies Partial<Record<ImageFileKey, string>>;
