import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import battleForestBackground from "@/assets/dungeons/scene/battle/forestBackground.png";
import { BattleKey } from "@/models/dungeons/keys/image/BattleKey";

export const BattleLoaderMap = {
  [BattleKey.BattleForestBackground]: (scene) =>
    scene.load.image(BattleKey.BattleForestBackground, battleForestBackground),
} as const satisfies Record<BattleKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
