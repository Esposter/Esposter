import type { SubCommandsDef } from "citty";

import { writeImaginarium } from "#src/services/genshinAssets/imaginarium/writeImaginarium";
import { defineCommand } from "citty";

export const imaginariumCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the Imaginarium Theater's seasons, each naming its difficulties, and every difficulty's level floor from the role combat tables into genshin-world",
    name: "imaginarium",
  },
  run: () => {
    writeImaginarium();
  },
});
