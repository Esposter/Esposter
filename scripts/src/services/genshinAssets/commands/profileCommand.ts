import type { SubCommandsDef } from "citty";

import { writeProfileText } from "#src/services/genshinAssets/profile/writeProfileText";
import { defineCommand } from "citty";

export const profileCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Write each playable character's Profile tab from the dump into genshin-world, in every language",
    name: "profile",
  },
  run: () => {
    for (const note of writeProfileText()) console.log(note);
  },
});
