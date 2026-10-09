import type { SubCommandsDef } from "citty";

import { writeArchive } from "#src/services/genshinAssets/archive/writeArchive";
import { writeArchiveText } from "#src/services/genshinAssets/archive/writeArchiveText";
import { defineCommand } from "citty";

export const archiveCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the Archive's sections from the dump's codex tables into genshin-world, and every entry's name in every language",
    name: "archive",
  },
  run: () => {
    for (const note of writeArchive()) console.log(note);
    for (const note of writeArchiveText()) console.log(note);
  },
});
