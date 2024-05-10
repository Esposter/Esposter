import worldHomeBuilding1Foreground from "@/assets/dungeons/scene/world/Home/HomeBuilding1/foreground.png";
import worldHomeBuilding2Foreground from "@/assets/dungeons/scene/world/Home/HomeBuilding2/foreground.png";
import worldHomeForeground from "@/assets/dungeons/scene/world/Home/foreground.png";
import { WorldKey } from "@/models/dungeons/keys/image/world/WorldKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const WorldLoaderMap = {
  [WorldKey.WorldHomeForeground]: (scene) => scene.load.image(WorldKey.WorldHomeForeground, worldHomeForeground),
  [WorldKey.WorldHomeBuilding1Foreground]: (scene) =>
    scene.load.image(WorldKey.WorldHomeBuilding1Foreground, worldHomeBuilding1Foreground),
  [WorldKey.WorldHomeBuilding2Foreground]: (scene) =>
    scene.load.image(WorldKey.WorldHomeBuilding2Foreground, worldHomeBuilding2Foreground),
} as const satisfies Record<WorldKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
