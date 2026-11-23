/* oxlint-disable no-await-in-loop -- Committed prefix: a destructive prune that fails stops the environments behind it, so nothing is deleted after the failure, the deletes already made before it stay, and the one that failed is the one named */
import type { SubCommandsDef } from "citty";

import { HostedAssetMissingIndexPolicy } from "#src/models/hostedAssets/HostedAssetMissingIndexPolicy";
import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { GAME_DATA_PRODUCT } from "#src/services/gameData/constants";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { createHostedAssetBucketClientMap } from "#src/services/hostedAssets/createHostedAssetBucketClientMap";
import { pruneHostedAssets } from "#src/services/hostedAssets/pruneHostedAssets";
import { readHostedAssetReachableObjects } from "#src/services/hostedAssets/readHostedAssetReachableObjects";
import { readLiveHostedAssetLocks } from "#src/services/hostedAssets/readLiveHostedAssetLocks";
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
    const locks = readLiveHostedAssetLocks(GAME_DATA_PRODUCT, await readGameDataLock());
    const bucketClientMap = createHostedAssetBucketClientMap(GAME_DATA_PRODUCT.bucket);
    for (const environment of Object.values(CloudflareEnvironment)) {
      const bucketClient = bucketClientMap[environment];
      const liveObjects = await readHostedAssetReachableObjects(
        bucketClient,
        locks,
        HostedAssetMissingIndexPolicy.Abort,
      );
      const result = await pruneHostedAssets({
        bucketClient,
        isDryRun: args["dry-run"],
        liveObjects,
        now: Date.now(),
        scopes: GAME_DATA_PRODUCT.scopes,
      });
      console.log(
        `${environment}: ${result.candidateCount} past retention, ${result.deletedCount} deleted, ${result.keptCount} kept by a write since the listing`,
      );
    }
  },
});
