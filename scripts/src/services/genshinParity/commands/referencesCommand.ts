import type { SubCommandsDef } from "citty";

import { referencesPackCommand } from "#src/services/genshinParity/commands/referencesPackCommand";
import { referencesRestoreCommand } from "#src/services/genshinParity/commands/referencesRestoreCommand";
import { defineCommand } from "citty";

export const referencesCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Keep the references the map names as lossless WebP objects in the game-data container, listed in the committed manifest",
    name: "references",
  },
  subCommands: { pack: referencesPackCommand, restore: referencesRestoreCommand },
});
