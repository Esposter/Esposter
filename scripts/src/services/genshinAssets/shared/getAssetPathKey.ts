import type { AssetType } from "#src/models/genshinAssets/shared/AssetType";

import { getPathDigest } from "#src/services/genshinAssets/shared/getPathDigest";

// The key the community index names an asset of this type and path by, as a decimal string: the 40-bit path hash of
// `getPathDigest`, its PathHashPre in the low byte and its PathHashLast in the four above (`getPathHashKey` keys a
// Placement's 64-bit path hash the same way)
export const getAssetPathKey = (path: string, type: AssetType): string =>
  String(getPathDigest(path, type).readUIntLE(0, 5));
