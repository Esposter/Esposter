import type { AssetLoader } from "#src/models/dungeons/loader/AssetLoader";

import KenneyFutureNarrow from "#src/assets/dungeons/thirdParty/kenneysAssets/fonts/KenneyFutureNarrow.woff2";
import { FontKey } from "#src/models/dungeons/keys/FontKey";

export const FontLoaderMap = {
  [FontKey.KenneyFutureNarrow]: (scene) => scene.load.font(FontKey.KenneyFutureNarrow, KenneyFutureNarrow),
} as const satisfies Record<FontKey, AssetLoader>;

export const FontLoaders = Object.values(FontLoaderMap);
