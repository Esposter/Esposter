import type { SubCommandsDef } from "citty";

import { GAME_DATA_KEYS_PATH } from "#src/services/gameData/constants";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { writeGameDataKeys } from "#src/services/gameData/writeGameDataKeys";
import { defineCommand } from "citty";

export const keysCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Regenerate the nested game data keys from the committed lock, without publishing anything",
    name: "keys",
  },
  run: async () => {
    await writeGameDataKeys(await readGameDataLock(), GAME_DATA_KEYS_PATH);
  },
});
