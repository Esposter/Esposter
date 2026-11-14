import type { PublishGameDataStepOptions } from "#src/models/gameData/PublishGameDataStepOptions";

import { GameDataPublishOutcome } from "#src/models/gameData/GameDataPublishOutcome";
import { commitGameDataLock } from "#src/services/gameData/commitGameDataLock";
import { createGameDataBucketClientMap } from "#src/services/gameData/createGameDataBucketClientMap";
import { publishGameData } from "#src/services/gameData/publishGameData";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { summarizeGameDataChanges } from "#src/services/gameData/summarizeGameDataChanges";
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
  const result = await publishGameData({
    createBucketClientMap: isDryRun ? undefined : createGameDataBucketClientMap,
    currentLock,
    publication,
    scopes,
  });
  if (result.outcome === GameDataPublishOutcome.Unchanged) return `${label}: unchanged, no request made`;
  if (result.outcome === GameDataPublishOutcome.Empty) return `${label}: nothing published, no request made`;
  if (result.outcome === GameDataPublishOutcome.DryRun)
    return [
      `${label}: dry run, ${result.storedObjectCount} records would be published`,
      ...(await summarizeGameDataChanges(currentLock, result.nextLock, result.records)),
    ].join("\n");
  await commitGameDataLock(scopes, result.plannedLock);
  const { uploadedCountMap } = result;
  return `${label}: ${result.storedObjectCount} records published, ${uploadedCountMap[CloudflareEnvironment.Development]} objects uploaded to dev and ${uploadedCountMap[CloudflareEnvironment.Production]} to prod`;
};
