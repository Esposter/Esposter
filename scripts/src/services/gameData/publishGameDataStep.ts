import type { PublishGameDataStepOptions } from "#src/models/gameData/PublishGameDataStepOptions";

import { HostedAssetPublishOutcome } from "#src/models/hostedAssets/HostedAssetPublishOutcome";
import {
  GAME_DATA_KEYS_PATH,
  GAME_DATA_LOCK_FILE_NAME,
  GAME_DATA_PRODUCT,
  GAME_DATA_PRODUCT_NAME,
} from "#src/services/gameData/constants";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { summarizeGameDataChanges } from "#src/services/gameData/summarizeGameDataChanges";
import { commitHostedAssetLock } from "#src/services/hostedAssets/commitHostedAssetLock";
import { createHostedAssetBucketClientMap } from "#src/services/hostedAssets/createHostedAssetBucketClientMap";
import { formatIdleHostedAssetPublish } from "#src/services/hostedAssets/formatIdleHostedAssetPublish";
import { planHostedAssetPublication } from "#src/services/hostedAssets/planHostedAssetPublication";
import { publishHostedAssets } from "#src/services/hostedAssets/publishHostedAssets";
import { readOtherHostedAssetLocks } from "#src/services/hostedAssets/readOtherHostedAssetLocks";
import { writeHostedAssetKeys } from "#src/services/hostedAssets/writeHostedAssetKeys";
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
    otherLocks: await readOtherHostedAssetLocks(GAME_DATA_PRODUCT),
    plan: planHostedAssetPublication(publication),
    product: GAME_DATA_PRODUCT,
    scopes,
  });
  if (result.outcome === HostedAssetPublishOutcome.Unchanged || result.outcome === HostedAssetPublishOutcome.Empty)
    return formatIdleHostedAssetPublish(label, result.outcome);
  if (result.outcome === HostedAssetPublishOutcome.DryRun)
    return [
      `${label}: dry run, ${result.storedObjectCount} records would be published`,
      ...(await summarizeGameDataChanges(currentLock, result.nextLock, result.records)),
    ].join("\n");
  const lock = await commitHostedAssetLock(GAME_DATA_PRODUCT, scopes, result.plannedLock);
  await writeHostedAssetKeys(GAME_DATA_PRODUCT_NAME, GAME_DATA_LOCK_FILE_NAME, lock, GAME_DATA_KEYS_PATH);
  const { uploadedCountMap } = result;
  return `${label}: ${result.storedObjectCount} records published, ${uploadedCountMap[CloudflareEnvironment.Development]} objects uploaded to dev and ${uploadedCountMap[CloudflareEnvironment.Production]} to prod`;
};
