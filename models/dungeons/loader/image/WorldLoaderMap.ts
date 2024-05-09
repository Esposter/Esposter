import worldHomeForeground from "@/assets/dungeons/scene/world/Home/foreground.png";
import { WorldKey } from "@/models/dungeons/keys/image/WorldKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const WorldLoaderMap = {
  [WorldKey.WorldHomeForeground]: (scene) => scene.load.image(WorldKey.WorldHomeForeground, worldHomeForeground),
} as const satisfies Record<WorldKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
