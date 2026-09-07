import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { BattleKey } from "#shared/models/dungeons/keys/image/BattleKey";
import battleForestBackground from "@/assets/dungeons/scene/battle/forestBackground.png";

export const BattleLoaderMap = {
  [BattleKey.BattleForestBackground]: (scene) =>
    scene.load.image(BattleKey.BattleForestBackground, battleForestBackground),
} as const satisfies Record<BattleKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
