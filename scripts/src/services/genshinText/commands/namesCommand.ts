import type { SubCommandsDef } from "citty";

import { writeNames } from "#src/services/genshinText/writeNames";
import { defineCommand } from "citty";

export const namesCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Write every name the world's stat tables cite, its characters' and its weapons', in every language",
    name: "names",
  },
  run: () => {
    for (const note of writeNames()) console.log(note);
  },
});
