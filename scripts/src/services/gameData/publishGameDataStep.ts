import type { PublishGameDataStepOptions } from "#src/models/gameData/PublishGameDataStepOptions";

import { HostedAssetPublishOutcome } from "#src/models/hostedAssets/HostedAssetPublishOutcome";
import { GAME_DATA_KEYS_PATH, GAME_DATA_PRODUCT } from "#src/services/gameData/constants";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { summarizeGameDataChanges } from "#src/services/gameData/summarizeGameDataChanges";
import { writeGameDataKeys } from "#src/services/gameData/writeGameDataKeys";
import { commitHostedAssetLock } from "#src/services/hostedAssets/commitHostedAssetLock";
import { createHostedAssetBucketClientMap } from "#src/services/hostedAssets/createHostedAssetBucketClientMap";
import { publishHostedAssets } from "#src/services/hostedAssets/publishHostedAssets";
import { CloudflareEnvironment } from "@esposter/db-schema";

// One generator's publish: the scopes it replaces are stored in both environments' buckets, and the lock is committed only
// Once both have them. A dry run stores nothing and needs no credential, and its note adds what it would change against the
// Published records. A publication that stores nothing and leaves the lock as it is makes no bucket client, so it needs no
// Credential either. Returns a note of what the step did to the lock
export const publishGameDataStep = async ({
  isDryRun,
  publication,
  scopes,
}: PublishGameDataStepOptions): Promise<string> => {
  const label = scopes.join(", ");
  const currentLock = await readGameDataLock();
  const result = await publishHostedAssets({
    createBucketClientMap: isDryRun ? undefined : () => createHostedAssetBucketClientMap(GAME_DATA_PRODUCT.bucket),
    currentLock,
    product: GAME_DATA_PRODUCT,
    publication,
    scopes,
  });
  if (result.outcome === HostedAssetPublishOutcome.Unchanged) return `${label}: unchanged, no request made`;
  if (result.outcome === HostedAssetPublishOutcome.Empty) return `${label}: nothing published, no request made`;
  if (result.outcome === HostedAssetPublishOutcome.DryRun)
    return [
      `${label}: dry run, ${result.storedObjectCount} records would be published`,
      ...(await summarizeGameDataChanges(currentLock, result.nextLock, result.records)),
    ].join("\n");
  const lock = await commitHostedAssetLock(GAME_DATA_PRODUCT, scopes, result.plannedLock);
  await writeGameDataKeys(lock, GAME_DATA_KEYS_PATH);
  const { uploadedCountMap } = result;
  return `${label}: ${result.storedObjectCount} records published, ${uploadedCountMap[CloudflareEnvironment.Development]} objects uploaded to dev and ${uploadedCountMap[CloudflareEnvironment.Production]} to prod`;
};
