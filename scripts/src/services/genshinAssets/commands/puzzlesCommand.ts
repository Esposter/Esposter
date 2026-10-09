import type { SubCommandsDef } from "citty";

import { writePuzzlePlaces } from "#src/services/genshinAssets/puzzles/writePuzzlePlaces";
import { defineCommand } from "citty";

export const puzzlesCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write each puzzle mechanism the official map marks, carried into the scene by the fit, as one slice per region in genshin-world",
    name: "puzzles",
  },
  run: async () => {
    console.log(await writePuzzlePlaces());
  },
});
