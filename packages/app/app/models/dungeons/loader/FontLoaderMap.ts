import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { FontKey } from "#shared/models/dungeons/keys/FontKey";
import KenneyFutureNarrow from "@/assets/dungeons/thirdParty/kenneysAssets/fonts/KenneyFutureNarrow.woff2";

export const FontLoaderMap: Record<FontKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [FontKey.KenneyFutureNarrow]: (scene) => scene.load.font(FontKey.KenneyFutureNarrow, KenneyFutureNarrow),
};
