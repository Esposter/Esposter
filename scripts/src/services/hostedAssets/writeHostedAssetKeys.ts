import type { HostedAssetLock } from "hosted-assets";

import { getHostedAssetKeysSource } from "#src/services/hostedAssets/getHostedAssetKeysSource";
import { formatGeneratedSource } from "#src/services/shared/formatGeneratedSource";
import { publishFile } from "#src/services/shared/publishFile";

// Published over the keys file the way the lock is, so an interrupted write leaves the committed keys whole
export const writeHostedAssetKeys = async (
  productName: string,
  lock: HostedAssetLock,
  keysPath: string,
): Promise<void> =>
  publishFile(keysPath, await formatGeneratedSource(keysPath, getHostedAssetKeysSource(productName, lock)));
