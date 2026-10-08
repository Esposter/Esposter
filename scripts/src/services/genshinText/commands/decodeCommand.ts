import type { SubCommandsDef } from "citty";

import { decodeGameText } from "#src/services/genshinText/decodeGameText";
import { defineCommand } from "citty";

export const decodeCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Decode every language's text map from the installed game's own chunks, in place of the community dump's maps",
    name: "decode",
  },
  run: async () => {
    for (const note of await decodeGameText()) console.log(note);
  },
});
