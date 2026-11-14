/* oxlint-disable no-await-in-loop -- The buckets are pruned one after the other, so a failure names one */
import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { createGameDataBucketClientMap } from "#src/services/gameData/createGameDataBucketClientMap";
import { pruneGameData } from "#src/services/gameData/pruneGameData";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readGameDataReachableObjects } from "#src/services/gameData/readGameDataReachableObjects";
import { readLiveGameDataLocks } from "#src/services/gameData/readLiveGameDataLocks";
import { runGit } from "#src/services/shared/runGit";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { getResult } from "@esposter/shared";
import { defineCommand } from "citty";

export const pruneCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Delete the game data no live lock reaches and that is older than 90 days, from both environments' buckets, after fetching origin",
    name: "prune",
  },
  run: async ({ args }) => {
    // Without a fetch the live set is stale, and a stale set could delete what a branch just pushed, so the prune is skipped
    const isFetched = getResult(() => runGit(["fetch", "-q", "origin"])).match(
      () => true,
      (error) => {
        console.warn(`Prune skipped: git fetch origin failed (${error.message})`);
        return false;
      },
    );
    // A skipped prune deleted nothing, so the exit code tells a chain that runs after it that the prune did not happen
    if (!isFetched) {
      process.exitCode = 1;
      return;
    }
    const locks = readLiveGameDataLocks(await readGameDataLock());
    const bucketClientMap = createGameDataBucketClientMap();
    for (const environment of Object.values(CloudflareEnvironment)) {
      const bucketClient = bucketClientMap[environment];
      const liveObjects = await readGameDataReachableObjects(bucketClient, locks);
      const result = await pruneGameData({ bucketClient, isDryRun: args["dry-run"], liveObjects, now: Date.now() });
      console.log(
        `${environment}: ${result.candidateCount} past retention, ${result.deletedCount} deleted, ${result.keptCount} kept by a write since the listing`,
      );
    }
  },
});
