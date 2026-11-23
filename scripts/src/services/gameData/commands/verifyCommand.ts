import type { SubCommandsDef } from "citty";

import { GAME_DATA_PRODUCT } from "#src/services/gameData/constants";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { verifyHostedAssetProduct } from "#src/services/hostedAssets/verifyHostedAssetProduct";
import { defineCommand } from "citty";

export const verifyCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fetch every object the lock reaches from both environments' buckets, anonymously, and check each hashes to its name, and that the lock on disk is the committed one",
    name: "verify",
  },
  run: async () => {
    await verifyHostedAssetProduct(GAME_DATA_PRODUCT, await readGameDataLock());
  },
});
