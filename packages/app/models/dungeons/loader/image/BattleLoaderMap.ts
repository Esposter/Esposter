import battleForestBackground from "@/assets/dungeons/scene/battle/forestBackground.png";
import { BattleKey } from "@/models/dungeons/keys/image/BattleKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const BattleLoaderMap = {
  [BattleKey.BattleForestBackground]: (scene) =>
    scene.load.image(BattleKey.BattleForestBackground, battleForestBackground),
} as const satisfies Record<BattleKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
