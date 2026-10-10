import type { SubCommandsDef } from "citty";

import { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import { GameDataTargetBlobServiceUrlMap } from "#src/services/gameData/GameDataTargetBlobServiceUrlMap";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { verifyGameData } from "#src/services/gameData/verifyGameData";
import { AzureContainer } from "@esposter/db-schema";
import { defineCommand } from "citty";

export const verifyCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fetch every object the lock reaches from both accounts, anonymously, and check each hashes to its name",
    name: "verify",
  },
  run: async () => {
    const lock = await readGameDataLock();
    for (const target of Object.values(GameDataTarget)) {
      const baseUrl = `${GameDataTargetBlobServiceUrlMap[target]}/${AzureContainer.AppAssets}`;
      // oxlint-disable-next-line no-await-in-loop -- The accounts are checked one after the other, so a failure names one
      const checkedCount = await verifyGameData(baseUrl, lock);
      console.log(`${target}: ${checkedCount} objects verified`);
    }
  },
});
