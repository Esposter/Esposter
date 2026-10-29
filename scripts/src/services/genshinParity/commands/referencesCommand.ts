import type { SubCommandsDef } from "citty";

import { referencesPackCommand } from "#src/services/genshinParity/commands/referencesPackCommand";
import { referencesRestoreCommand } from "#src/services/genshinParity/commands/referencesRestoreCommand";
import { defineCommand } from "citty";

export const referencesCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Keep the references the map names as lossless WebP files in the repository, beside their snapshots or flat in the references folder, listed in the committed manifest; and the records the parity tools read",
    name: "references",
  },
  subCommands: { pack: referencesPackCommand, restore: referencesRestoreCommand },
});
