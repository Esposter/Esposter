import type { SubCommandsDef } from "citty";

import { GAME_DATA_PRODUCT } from "#src/services/gameData/constants";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { getLockDifferences } from "#src/services/hostedAssets/getLockDifferences";
import { readLockAt } from "#src/services/hostedAssets/readLockAt";
import { verifyHostedAssets } from "#src/services/hostedAssets/verifyHostedAssets";
import { CloudflareEnvironment, HostedAssetOriginMap } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const verifyCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fetch every object the lock reaches from both environments' buckets, anonymously, and check each hashes to its name, and that the lock on disk is the committed one",
    name: "verify",
  },
  run: async () => {
    const lock = await readGameDataLock();
    // The lock on disk is the one a publish wrote, and it must be the one committed, since every checkout reads the committed
    // One, so a publish whose lock was not committed fails here before any bucket is read
    const differences = getLockDifferences(lock, readLockAt(GAME_DATA_PRODUCT, "HEAD"));
    if (differences.length > 0)
      throw new InvalidOperationError(
        Operation.Read,
        "game data lock",
        `differs from the committed lock at ${differences.join(", ")}`,
      );
    const environments = Object.values(CloudflareEnvironment);
    // The buckets are read-only and independent, so they are checked together, and each failure is named by its
    // Environment, since a network error from fetch carries no URL of its own
    const settled = await Promise.allSettled(
      environments.map((environment) => verifyHostedAssets(HostedAssetOriginMap[environment], lock)),
    );
    const failures: string[] = [];
    for (const [index, result] of settled.entries()) {
      const environment = environments[index];
      if (result.status === "fulfilled") console.log(`${environment}: ${result.value} objects verified`);
      else
        failures.push(
          `${environment}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
        );
    }
    if (failures.length > 0) throw new InvalidOperationError(Operation.Read, "game data", failures.join("\n"));
  },
});
