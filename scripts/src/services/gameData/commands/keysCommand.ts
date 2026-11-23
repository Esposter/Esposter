import type { SubCommandsDef } from "citty";

import {
  GAME_DATA_KEYS_PATH,
  GAME_DATA_LOCK_FILE_NAME,
  GAME_DATA_PRODUCT_NAME,
} from "#src/services/gameData/constants";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { writeHostedAssetKeys } from "#src/services/hostedAssets/writeHostedAssetKeys";
import { defineCommand } from "citty";

export const keysCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Regenerate the nested game data keys from the committed lock, without publishing anything",
    name: "keys",
  },
  run: async () => {
    await writeHostedAssetKeys(
      GAME_DATA_PRODUCT_NAME,
      GAME_DATA_LOCK_FILE_NAME,
      await readGameDataLock(),
      GAME_DATA_KEYS_PATH,
    );
  },
});
