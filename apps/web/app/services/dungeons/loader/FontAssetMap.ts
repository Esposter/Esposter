import { FileKey } from "#shared/generated/phaser/FileKey";
import KenneyFutureNarrow from "#src/assets/dungeons/thirdParty/kenneysAssets/fonts/KenneyFutureNarrow.woff2";

export const FontAssetMap = {
  [FileKey.ThirdPartyKenneysAssetsFontsKenneyFutureNarrow]: KenneyFutureNarrow,
} as const satisfies Partial<Record<FileKey, string>>;
