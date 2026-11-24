import type { HostedAssetPruneResult } from "#src/models/hostedAssets/HostedAssetPruneResult";
import type { PruneHostedAssetsOptions } from "#src/models/hostedAssets/PruneHostedAssetsOptions";
import type { R2ListedObject } from "@esposter/db";

import { HOSTED_ASSET_RETENTION_MS } from "#src/services/hostedAssets/constants";
import { readBucketLastModifiedMap } from "#src/services/hostedAssets/readBucketLastModifiedMap";
import { toHostedAssetPaths } from "#src/services/hostedAssets/toHostedAssetPaths";
import { settleAll } from "@esposter/shared";

// Deletes what no live lock reaches and what is older than retention. R2 has no conditional delete, so the candidates
// Are listed again just before the deletes, and one a write has moved past the cutoff since the first listing is kept.
// That narrows the race between the cutoff check and the delete to the one listing's round trip, rather than the whole
// Batch
export const pruneHostedAssets = async ({
  bucketClient,
  isDryRun,
  liveObjects,
  now,
  scopes,
}: PruneHostedAssetsOptions): Promise<HostedAssetPruneResult> => {
  const livePaths = toHostedAssetPaths(liveObjects);
  const cutoff = new Date(now - HOSTED_ASSET_RETENTION_MS);
  const isPastRetention = ({ key, lastModified }: R2ListedObject) =>
    !livePaths.has(key) && lastModified < cutoff && scopes.includes(key.split("/")[0] ?? "");
  // Only an object under a product's scope is a candidate: the bucket holds other publishes too, which no lock names
  const candidateKeys = (await bucketClient.list("")).filter((object) => isPastRetention(object)).map(({ key }) => key);
  if (isDryRun) return { candidateCount: candidateKeys.length, deletedCount: 0, keptCount: 0 };
  const listedAgain = await readBucketLastModifiedMap(bucketClient);
  // A key the second listing no longer holds is already gone, which a delete counts as done
  const deletableKeys = candidateKeys.filter((key) => {
    const lastModified = listedAgain.get(key);
    return lastModified === undefined || lastModified < cutoff;
  });
  await settleAll(deletableKeys.map((key) => () => bucketClient.delete(key)));
  return {
    candidateCount: candidateKeys.length,
    deletedCount: deletableKeys.length,
    keptCount: candidateKeys.length - deletableKeys.length,
  };
};
