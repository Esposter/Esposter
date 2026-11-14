import type { GameDataPruneResult } from "#src/models/gameData/GameDataPruneResult";
import type { PruneGameDataOptions } from "#src/models/gameData/PruneGameDataOptions";
import type { R2ListedObject } from "@esposter/db";

import { checkIsGameDataset } from "#src/services/gameData/checkIsGameDataset";
import { GAME_DATA_RETENTION_MS, MAX_CONCURRENT_OBJECT_REQUESTS } from "#src/services/gameData/constants";
import { toGameDataObjectKeys } from "#src/services/gameData/toGameDataObjectKeys";
import { settleAll } from "@esposter/shared";

// Deletes what no live lock reaches and what is older than retention. R2 has no conditional delete, so the candidates are
// Listed again just before the deletes, and one a write has moved past the cutoff since the first listing is kept. That
// Narrows the race the cutoff condition closed on Azure to the one listing's round trip, rather than the whole batch
export const pruneGameData = async ({
  bucketClient,
  isDryRun,
  liveObjects,
  now,
}: PruneGameDataOptions): Promise<GameDataPruneResult> => {
  const liveKeys = toGameDataObjectKeys(liveObjects);
  const cutoff = new Date(now - GAME_DATA_RETENTION_MS);
  const isPastRetention = ({ key, lastModified }: R2ListedObject) =>
    !liveKeys.has(key) && lastModified < cutoff && checkIsGameDataset(key.split("/")[0] ?? "");
  // Only a game data dataset's objects are candidates: the bucket holds other publishes too, which no lock names
  const candidateKeys = (await bucketClient.list("")).filter((object) => isPastRetention(object)).map(({ key }) => key);
  if (isDryRun) return { candidateCount: candidateKeys.length, deletedCount: 0, keptCount: 0 };
  const listedAgain = new Map(
    (await bucketClient.list("")).map(({ key, lastModified }) => [key, lastModified] as const),
  );
  // A key the second listing no longer holds is already gone, which a delete counts as done
  const deletableKeys = candidateKeys.filter((key) => {
    const lastModified = listedAgain.get(key);
    return lastModified === undefined || lastModified < cutoff;
  });
  await settleAll(
    deletableKeys.map((key) => () => bucketClient.delete(key)),
    MAX_CONCURRENT_OBJECT_REQUESTS,
  );
  return {
    candidateCount: candidateKeys.length,
    deletedCount: deletableKeys.length,
    keptCount: candidateKeys.length - deletableKeys.length,
  };
};
