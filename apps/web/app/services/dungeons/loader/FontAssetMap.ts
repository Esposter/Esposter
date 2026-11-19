import KenneyFutureNarrow from "#src/assets/dungeons/thirdParty/kenneysAssets/fonts/KenneyFutureNarrow.woff2";
import { FontKey } from "#src/models/dungeons/keys/FontKey";

export const FontAssetMap = { [FontKey.KenneyFutureNarrow]: KenneyFutureNarrow } as const satisfies Record<
  FontKey,
  string
>;
