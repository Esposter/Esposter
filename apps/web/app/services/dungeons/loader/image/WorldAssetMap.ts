import { WorldForegroundKey } from "#shared/models/dungeons/keys/image/world/WorldForegroundKey";
import worldHomeForeground from "#src/assets/dungeons/scene/world/Home/foreground.png";
import worldHomeBuilding1Foreground from "#src/assets/dungeons/scene/world/Home/HomeBuilding1/foreground.png";
import worldHomeBuilding2Foreground from "#src/assets/dungeons/scene/world/Home/HomeBuilding2/foreground.png";

export const WorldAssetMap = {
  [WorldForegroundKey.WorldHomeBuilding1Foreground]: worldHomeBuilding1Foreground,
  [WorldForegroundKey.WorldHomeBuilding2Foreground]: worldHomeBuilding2Foreground,
  [WorldForegroundKey.WorldHomeForeground]: worldHomeForeground,
} as const satisfies Record<WorldForegroundKey, string>;
