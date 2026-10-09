import type { SubCommandsDef } from "citty";

import { writeFriendship } from "#src/services/genshinAssets/friendship/writeFriendship";
import { defineCommand } from "citty";

export const friendshipCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the Friendship Levels (each level's total Companionship EXP) and the namecards from the dump into genshin-world",
    name: "friendship",
  },
  run: () => {
    writeFriendship();
  },
});
