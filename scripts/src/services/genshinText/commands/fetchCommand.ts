import type { SubCommandsDef } from "citty";

import { fetchDump } from "#src/services/genshinText/fetchDump";
import { defineCommand } from "citty";

export const fetchCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fetch the readable texts and every table from AnimeGameData's main branch, the install's build, each file the dump lacks or holds at another size",
    name: "fetch",
  },
  run: async () => {
    for (const note of await fetchDump()) console.log(note);
  },
});
