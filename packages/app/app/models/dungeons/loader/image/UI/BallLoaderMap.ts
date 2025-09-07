import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { BallKey } from "#shared/models/dungeons/keys/image/UI/BallKey";
import cosmoBall from "@/assets/dungeons/UI/balls/cosmoBall.png";
import damagedBall from "@/assets/dungeons/UI/balls/damagedBall.png";

export const BallLoaderMap = {
  [BallKey.CosmoBall]: (scene) => scene.load.image(BallKey.CosmoBall, cosmoBall),
  [BallKey.DamagedBall]: (scene) => scene.load.image(BallKey.DamagedBall, damagedBall),
} as const satisfies Record<BallKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
