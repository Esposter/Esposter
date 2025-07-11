import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { TitleKey } from "#shared/models/dungeons/keys/image/TitleKey";
import titleScreenBackground from "@/assets/dungeons/scene/title/screenBackground.png";
import titleText from "@/assets/dungeons/scene/title/text.png";
import titleTextBackground from "@/assets/dungeons/scene/title/textBackground.png";

export const TitleLoaderMap = {
  [TitleKey.TitleScreenBackground]: (scene) => scene.load.image(TitleKey.TitleScreenBackground, titleScreenBackground),
  [TitleKey.TitleText]: (scene) => scene.load.image(TitleKey.TitleText, titleText),
  [TitleKey.TitleTextBackground]: (scene) => scene.load.image(TitleKey.TitleTextBackground, titleTextBackground),
} as const satisfies Record<TitleKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
