import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";
import type { HostedAssetLock } from "hosted-assets";

import { getLockDifferences } from "#src/services/hostedAssets/getLockDifferences";
import { toHostedAssetPaths } from "#src/services/hostedAssets/toHostedAssetPaths";
import { getHostedAssetPath } from "hosted-assets";

// A files product's dry run against the published lock: the lock names a publish would add, remove or change, then each
// Object it would store, which is a record the published lock does not name. Nothing is stored
export const formatHostedAssetFilesDryRun = (
  name: string,
  currentLock: HostedAssetLock,
  nextLock: HostedAssetLock,
  records: HostedAssetRecord[],
): string => {
  const namedPaths = toHostedAssetPaths([...Object.values(currentLock.objects), ...Object.values(currentLock.indexes)]);
  const storedRecords = records.filter((record) => !namedPaths.has(getHostedAssetPath(record)));
  return [
    `${name}: dry run, nothing stored`,
    ...getLockDifferences(nextLock, currentLock).map((difference) => `  ${difference}`),
    ...storedRecords.map((record) => `  store ${getHostedAssetPath(record)}: ${record.bytes.byteLength} bytes`),
  ].join("\n");
};
