import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import KenneyFutureNarrow from "@/assets/dungeons/thirdParty/kenneysAssets/fonts/KenneyFutureNarrow.woff2";
import { FontKey } from "@/models/dungeons/keys/FontKey";

export const FontLoaderMap: Record<FontKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [FontKey.KenneyFutureNarrow]: (scene) => scene.load.font(FontKey.KenneyFutureNarrow, KenneyFutureNarrow),
};
