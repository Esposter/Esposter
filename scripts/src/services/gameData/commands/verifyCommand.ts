import type { SubCommandsDef } from "citty";

import { getGameDataBaseUrl } from "#src/services/gameData/getGameDataBaseUrl";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { verifyGameData } from "#src/services/gameData/verifyGameData";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const verifyCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fetch every object the lock reaches from both environments' buckets, anonymously, and check each hashes to its name",
    name: "verify",
  },
  run: async () => {
    const lock = await readGameDataLock();
    const environments = Object.values(CloudflareEnvironment);
    // The buckets are read-only and independent, so they are checked together, and each failure is named by its
    // Environment, since a network error from fetch carries no URL of its own
    const settled = await Promise.allSettled(
      environments.map((environment) => verifyGameData(getGameDataBaseUrl(environment), lock)),
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
