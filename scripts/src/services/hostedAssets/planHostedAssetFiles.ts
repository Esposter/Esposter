import type { HostedAssetPlan } from "#src/models/hostedAssets/HostedAssetPlan";
import type { HostedAssetSourceFile } from "#src/models/hostedAssets/HostedAssetSourceFile";

import { getHostedAssetLockKey } from "#src/services/hostedAssets/getHostedAssetLockKey";
import { toHostedAssetLockObject } from "#src/services/hostedAssets/toHostedAssetLockObject";
import { getHostedAssetPath } from "hosted-assets";

// The plan of a files product: each file is one object under the product's scope, named by the sha256 of its bytes, and
// Its Lock key is that scope and the file's key under the folder, so the scope's keys are the ones a publish replaces.
// Two files Of the same bytes and extension are one object, stored once
export const planHostedAssetFiles = (scope: string, files: HostedAssetSourceFile[]): HostedAssetPlan => {
  const entries = files.map(
    ({ bytes, extension, key, sha256 }) =>
      [getHostedAssetLockKey(scope, key), { bytes, extension, isIndex: false, scope, sha256 }] as const,
  );
  return {
    lock: {
      indexes: {},
      objects: Object.fromEntries(entries.map(([lockKey, record]) => [lockKey, toHostedAssetLockObject(record)])),
    },
    records: [...new Map(entries.map(([, record]) => [getHostedAssetPath(record), record])).values()],
  };
};
