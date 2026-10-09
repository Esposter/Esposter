import type { SubCommandsDef } from "citty";

import { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { createGameDataContainerClient } from "#src/services/gameData/createGameDataContainerClient";
import { pruneGameData } from "#src/services/gameData/pruneGameData";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readGameDataReachableHashes } from "#src/services/gameData/readGameDataReachableHashes";
import { readLiveGameDataLocks } from "#src/services/gameData/readLiveGameDataLocks";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { defineCommand } from "citty";

export const pruneCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Delete the game data no live lock reaches and that is older than 90 days, from both accounts, after fetching origin",
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
    if (!isFetched) return;
    const locks = readLiveGameDataLocks(await readGameDataLock());
    for (const target of Object.values(GameDataTarget)) {
      const containerClient = createGameDataContainerClient(target);
      // oxlint-disable-next-line no-await-in-loop -- The accounts are pruned one after the other, so a failure names one
      const liveHashes = await readGameDataReachableHashes(containerClient, locks);
      // oxlint-disable-next-line no-await-in-loop -- As above
      const result = await pruneGameData({ containerClient, isDryRun: args["dry-run"], liveHashes, now: Date.now() });
      console.log(
        `${target}: ${result.candidateCount} past retention, ${result.deletedCount} deleted, ${result.keptCount} kept by a write since the listing`,
      );
    }
  },
});
