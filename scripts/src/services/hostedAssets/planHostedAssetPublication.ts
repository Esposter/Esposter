import type { HostedAssetPlan } from "#src/models/hostedAssets/HostedAssetPlan";
import type { HostedAssetPublication } from "#src/models/hostedAssets/HostedAssetPublication";
import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";

import { createHostedAssetRecord } from "#src/services/hostedAssets/createHostedAssetRecord";
import { toHostedAssetLockObject } from "#src/services/hostedAssets/toHostedAssetLockObject";
import { getHostedAssetPath } from "hosted-assets";

// The lock entries a publication names and every object they reach, each record once even when several names reach
// It. An index's entries are sorted by id before their hashes are collected, so the index object is the same whatever
// Order the step produced its records in. An entry is stored under its index's scope, so one record reached under two
// Scopes is two records.
export const planHostedAssetPublication = ({ indexes, objects }: HostedAssetPublication): HostedAssetPlan => {
  const recordMap = new Map<string, HostedAssetRecord>();
  const addRecord = (scope: string, value: unknown, isIndex: boolean): HostedAssetRecord => {
    const record = createHostedAssetRecord(scope, value, isIndex);
    recordMap.set(getHostedAssetPath(record), record);
    return record;
  };
  const objectLock = Object.fromEntries(
    Object.entries(objects).map(([scope, value]) => [scope, toHostedAssetLockObject(addRecord(scope, value, false))]),
  );
  const indexLock = Object.fromEntries(
    Object.entries(indexes).map(([indexScope, entries]) => {
      const entryHashes = Object.fromEntries(
        Object.keys(entries)
          .toSorted()
          .map((entryId) => [entryId, addRecord(indexScope, entries[entryId], false).sha256]),
      );
      return [indexScope, toHostedAssetLockObject(addRecord(indexScope, entryHashes, true))];
    }),
  );
  return { lock: { indexes: indexLock, objects: objectLock }, records: [...recordMap.values()] };
};
