import { DUNGEONS_SCOPE } from "#src/services/dungeons/scope";
import { getHostedAssetFileKey } from "#src/services/hostedAssets/getHostedAssetFileKey";
import { toHostedAssetFileKey } from "#src/services/hostedAssets/toHostedAssetFileKey";

// The name a dungeons lock key renders under: its file's path under the dungeons scope, derived as the file-pack generator derived it
export const toDungeonsKeyName = (lockKey: string): string =>
  toHostedAssetFileKey(getHostedAssetFileKey(DUNGEONS_SCOPE, lockKey));
