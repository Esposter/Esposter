import type { AssetLoader } from "@/models/dungeons/loader/AssetLoader";

import { WorldForegroundKey } from "#shared/models/dungeons/keys/image/world/WorldForegroundKey";
import worldHomeForeground from "@/assets/dungeons/scene/world/Home/foreground.png";
import worldHomeBuilding1Foreground from "@/assets/dungeons/scene/world/Home/HomeBuilding1/foreground.png";
import worldHomeBuilding2Foreground from "@/assets/dungeons/scene/world/Home/HomeBuilding2/foreground.png";

export const WorldLoaderMap = {
  [WorldForegroundKey.WorldHomeBuilding1Foreground]: (scene) =>
    scene.load.image(WorldForegroundKey.WorldHomeBuilding1Foreground, worldHomeBuilding1Foreground),
  [WorldForegroundKey.WorldHomeBuilding2Foreground]: (scene) =>
    scene.load.image(WorldForegroundKey.WorldHomeBuilding2Foreground, worldHomeBuilding2Foreground),
  [WorldForegroundKey.WorldHomeForeground]: (scene) =>
    scene.load.image(WorldForegroundKey.WorldHomeForeground, worldHomeForeground),
} as const satisfies Record<WorldForegroundKey, AssetLoader>;
