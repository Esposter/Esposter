import type { SubCommandsDef } from "citty";

import { getGameDataBaseUrl } from "#src/services/gameData/getGameDataBaseUrl";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { verifyGameData } from "#src/services/gameData/verifyGameData";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { defineCommand } from "citty";

export const verifyCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fetch every object the lock reaches from both environments' buckets, anonymously, and check each hashes to its name",
    name: "verify",
  },
  run: async () => {
    const lock = await readGameDataLock();
    for (const environment of Object.values(CloudflareEnvironment)) {
      // oxlint-disable-next-line no-await-in-loop -- The buckets are checked one after the other, so a failure names one
      const checkedCount = await verifyGameData(getGameDataBaseUrl(environment), lock);
      console.log(`${environment}: ${checkedCount} objects verified`);
    }
  },
});
