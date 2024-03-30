import titleScreenBackground from "@/assets/dungeons/title/screenBackground.png";
import titleText from "@/assets/dungeons/title/text.png";
import titleTextBackground from "@/assets/dungeons/title/textBackground.png";
import { TitleKey } from "@/models/dungeons/keys/image/TitleKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const TitleLoaderMap = {
  [TitleKey.TitleScreenBackground]: (scene) => scene.load.image(TitleKey.TitleScreenBackground, titleScreenBackground),
  [TitleKey.TitleTextBackground]: (scene) => scene.load.image(TitleKey.TitleTextBackground, titleTextBackground),
  [TitleKey.TitleText]: (scene) => scene.load.image(TitleKey.TitleText, titleText),
} as const satisfies Record<TitleKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
