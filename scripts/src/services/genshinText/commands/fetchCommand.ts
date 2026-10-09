import type { SubCommandsDef } from "citty";

import { fetchDump } from "#src/services/genshinText/fetchDump";
import { defineCommand } from "citty";

export const fetchCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fetch the readable texts and tables the dump lacks from AnimeGameData, keeping each file held at its size",
    name: "fetch",
  },
  run: async () => {
    for (const note of await fetchDump()) console.log(note);
  },
});
