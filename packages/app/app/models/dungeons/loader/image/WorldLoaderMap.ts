import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { WorldKey } from "#shared/models/dungeons/keys/image/world/WorldKey";
import worldHomeForeground from "@/assets/dungeons/scene/world/Home/foreground.png";
import worldHomeBuilding1Foreground from "@/assets/dungeons/scene/world/Home/HomeBuilding1/foreground.png";
import worldHomeBuilding2Foreground from "@/assets/dungeons/scene/world/Home/HomeBuilding2/foreground.png";

export const WorldLoaderMap = {
  [WorldKey.WorldHomeBuilding1Foreground]: (scene) =>
    scene.load.image(WorldKey.WorldHomeBuilding1Foreground, worldHomeBuilding1Foreground),
  [WorldKey.WorldHomeBuilding2Foreground]: (scene) =>
    scene.load.image(WorldKey.WorldHomeBuilding2Foreground, worldHomeBuilding2Foreground),
  [WorldKey.WorldHomeForeground]: (scene) => scene.load.image(WorldKey.WorldHomeForeground, worldHomeForeground),
} as const satisfies Record<WorldKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
