import cosmoBall from "@/assets/dungeons/UI/balls/cosmoBall.png";
import damagedBall from "@/assets/dungeons/UI/balls/damagedBall.png";
import { BallKey } from "@/models/dungeons/keys/image/UI/BallKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const BallLoaderMap = {
  [BallKey.CosmoBall]: (scene) => scene.load.image(BallKey.CosmoBall, cosmoBall),
  [BallKey.DamagedBall]: (scene) => scene.load.image(BallKey.DamagedBall, damagedBall),
} as const satisfies Record<BallKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
