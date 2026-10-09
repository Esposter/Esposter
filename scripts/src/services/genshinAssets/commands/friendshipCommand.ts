import type { SubCommandsDef } from "citty";

import { writeFriendshipLevels } from "#src/services/genshinAssets/friendship/writeFriendshipLevels";
import { defineCommand } from "citty";

export const friendshipCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Write the Friendship Levels (each level's total Companionship EXP) from the dump into genshin-world",
    name: "friendship",
  },
  run: () => {
    writeFriendshipLevels();
  },
});
