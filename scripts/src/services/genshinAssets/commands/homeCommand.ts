import type { SubCommandsDef } from "citty";

import { writeHomeRules } from "#src/services/genshinAssets/home/writeHomeRules";
import { defineCommand } from "citty";

export const homeCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the Serenitea Pot's furnishing blueprints, the diagrams that open them and the Trust and Adeptal Energy ranks from the dump into genshin-world",
    name: "home",
  },
  run: () => {
    writeHomeRules();
  },
});
