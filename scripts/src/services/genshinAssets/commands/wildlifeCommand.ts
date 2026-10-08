import type { SubCommandsDef } from "citty";

import { writeWildlifePlaces } from "#src/services/genshinAssets/wildlife/writeWildlifePlaces";
import { defineCommand } from "citty";

export const wildlifeCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write each bird and beast the official map marks as a fleeing kind, carried into the scene by the fit, as one slice per region in genshin-world",
    name: "wildlife",
  },
  run: async () => {
    console.log(await writeWildlifePlaces());
  },
});
